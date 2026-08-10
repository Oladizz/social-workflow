import { onRequest } from 'firebase-functions/v2/https';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { getFunctions } from 'firebase-admin/functions';
import { getPiece } from './pieces';
import * as admin from 'firebase-admin';

import { getDb } from './db';

export * from './scheduler';
import { WorkflowNode, WorkflowEdge } from './types';
import axios from 'axios';

// ─── Variable Resolver Engine ─────────────────────────────────────────────────
// Replaces {{nodeId.property}} expressions with actual runtime values from the
// execution context. Supports deep paths like {{node_1.response.data.name}}.
function resolveVariables(template: string, context: Record<string, any>): string {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path: string) => {
    const parts = path.trim().split('.');
    let value: any = context;
    for (const part of parts) {
      if (value == null) return match; // Leave unresolved if path doesn't exist
      value = value[part];
    }
    if (value === undefined || value === null) return match;
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  });
}

// Recursively resolve all string values in an object
function resolveObjectVariables(obj: any, context: Record<string, any>): any {
  if (typeof obj === 'string') return resolveVariables(obj, context);
  if (Array.isArray(obj)) return obj.map(item => resolveObjectVariables(item, context));
  if (obj && typeof obj === 'object') {
    const resolved: any = {};
    for (const [key, val] of Object.entries(obj)) {
      resolved[key] = resolveObjectVariables(val, context);
    }
    return resolved;
  }
  return obj;
}

// ─── Condition Evaluator ──────────────────────────────────────────────────────
// Evaluates simple conditions like: { field: "status", operator: "equals", value: "active" }
function evaluateCondition(condition: any, payload: Record<string, any>): boolean {
  if (!condition) return true;
  const { field, operator, value } = condition;
  const fieldValue = getNestedValue(payload, field);

  switch (operator) {
    case 'equals':
    case '==':
      return String(fieldValue) === String(value);
    case 'not_equals':
    case '!=':
      return String(fieldValue) !== String(value);
    case 'contains':
      return String(fieldValue).includes(String(value));
    case 'not_contains':
      return !String(fieldValue).includes(String(value));
    case 'greater_than':
    case '>':
      return Number(fieldValue) > Number(value);
    case 'less_than':
    case '<':
      return Number(fieldValue) < Number(value);
    case 'is_empty':
      return !fieldValue || String(fieldValue).trim() === '';
    case 'is_not_empty':
      return !!fieldValue && String(fieldValue).trim() !== '';
    case 'starts_with':
      return String(fieldValue).startsWith(String(value));
    case 'ends_with':
      return String(fieldValue).endsWith(String(value));
    case 'regex':
      try { return new RegExp(String(value)).test(String(fieldValue)); } catch { return false; }
    default:
      return true;
  }
}

function getNestedValue(obj: any, path: string): any {
  if (!path) return obj;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

// ─── Enqueue Helper ───────────────────────────────────────────────────────────
// Enqueue a node execution using Firebase Cloud Tasks.
export async function enqueueNode(workflowId: string, nodeId: string, nodes: WorkflowNode[], edges: WorkflowEdge[], payload: Record<string, any>, executionId: string, delaySeconds?: number) {
  const queue = getFunctions().taskQueue('executeNodeTask');
  const taskData = { workflowId, nodeId, nodes, edges, payload, executionId };
  if (delaySeconds && delaySeconds > 0) {
    const scheduleTime = new Date(Date.now() + delaySeconds * 1000);
    await queue.enqueue(taskData, { scheduleTime });
  } else {
    await queue.enqueue(taskData);
  }
}

// ─── Log Execution Step to Firestore ──────────────────────────────────────────
async function logStep(executionId: string, nodeId: string, nodeType: string, status: string, input?: any, output?: any, error?: string) {
  try {
    await getDb().collection('executionLogs').doc(executionId).collection('steps').doc(nodeId).set({
      nodeId, nodeType, status, input, output, error,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.warn(`[LOG] Failed to log step ${nodeId}:`, e);
  }
}

// ─── Task Queue Handler ──────────────────────────────────────────────────────
export const executeNodeTask = onTaskDispatched(
  {
    retryConfig: { maxAttempts: 3, minBackoffSeconds: 30 },
    rateLimits: { maxConcurrentDispatches: 20 },
  },
  async (req) => {
    const { workflowId, nodeId, nodes, edges, payload = {}, executionId = '' } = req.data as {
      workflowId: string;
      nodeId: string;
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
      payload?: Record<string, any>;
      executionId?: string;
    };

    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.error(`[EXEC] Node ${nodeId} not found in workflow ${workflowId}`);
      return;
    }

    const nodeType = node.type || '';
    console.log(`[EXEC] ▶ Node ${node.id} (${nodeType})`);
    let nextPayload = { ...payload };
    // Store this node's resolved data in the context for variable resolution
    const resolvedData = resolveObjectVariables(node.data, nextPayload);

    try {
      // ═══════════════════════════════════════════════════════════════════════
      // TRIGGER NODE — Just pass through, enqueue downstream
      // ═══════════════════════════════════════════════════════════════════════
      if (nodeType === 'triggerNode') {
        console.log(`[EXEC] Trigger fired: ${resolvedData.triggerType || 'manual'}`);
        nextPayload._trigger = { type: resolvedData.triggerType, time: new Date().toISOString() };
        await logStep(executionId, nodeId, nodeType, 'success', null, nextPayload._trigger);
      }

      // ═══════════════════════════════════════════════════════════════════════
      // AI NODE — Multi-provider (Gemini, OpenAI, Claude) + AI Utility tasks
      // ═══════════════════════════════════════════════════════════════════════
      else if (nodeType === 'aiNode') {
        const provider = resolvedData.provider || 'gemini';
        const aiTask = resolvedData.aiTask || 'generate';
        const prompt = resolveVariables(resolvedData.prompt || '', nextPayload);
        const context = { payload: nextPayload, propsValue: { ...resolvedData, prompt } };

        // Map AI task to the correct piece and action
        let pieceName = provider;
        let actionName = 'generate_content'; // default

        // Utility AI tasks (sentiment, classify, extract, etc.) use the ai_utils piece
        const utilityTasks = ['sentiment', 'classify', 'extract', 'summarize', 'translate'];
        if (utilityTasks.includes(aiTask)) {
          pieceName = 'ai_utils';
          const taskMap: Record<string, string> = {
            sentiment: 'sentiment_analysis',
            classify: 'classify_text',
            extract: 'extract_entities',
            summarize: 'summarize_text',
            translate: 'translate_text',
          };
          actionName = taskMap[aiTask] || 'sentiment_analysis';
        } else {
          // Provider-specific task mapping
          const taskActionMap: Record<string, string> = {
            generate: provider === 'gemini' ? 'generate_content' : 'generate_text',
            chat: 'chat_conversation',
            vision: 'vision_analyze',
            transcribe: 'transcribe_audio',
            tts: 'text_to_speech',
            video: 'generate_video',
          };
          actionName = taskActionMap[aiTask] || (provider === 'gemini' ? 'generate_content' : 'generate_text');
        }

        const piece = getPiece(pieceName);
        if (piece && piece.actions[actionName]) {
          console.log(`[EXEC] AI: ${piece.displayName} → ${piece.actions[actionName].displayName}`);
          const result = await piece.actions[actionName].run(context);
          
          // Merge results into payload
          if (result.generatedText) nextPayload.generatedText = result.generatedText;
          if (result._chatHistory) nextPayload._chatHistory = result._chatHistory;
          nextPayload[nodeId] = result;
          
          await logStep(executionId, nodeId, nodeType, 'success', { provider, aiTask, prompt: prompt.slice(0, 200) }, result);
        } else {
          console.warn(`[EXEC] AI piece "${pieceName}" or action "${actionName}" not found`);
          await logStep(executionId, nodeId, nodeType, 'error', null, null, `Piece "${pieceName}" action "${actionName}" not found`);
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // ACTION NODE — Execute platform piece (Twitter, LinkedIn, etc.)
      // ═══════════════════════════════════════════════════════════════════════
      else if (nodeType === 'actionNode') {
        let platform = resolvedData.platform;
        const normalizedPlatform = platform?.toLowerCase() || '';
        
        let originalPlatform = normalizedPlatform;
        if (['twitter', 'x', 'youtube', 'linkedin', 'buffer', 'all'].includes(normalizedPlatform)) {
          platform = 'buffer';
        }

        const piece = getPiece(platform);
        if (!piece) {
          console.warn(`[EXEC] Piece "${platform}" not found.`);
          await logStep(executionId, nodeId, nodeType, 'error', null, null, `Piece "${platform}" not found`);
        } else {
          const actionName = Object.keys(piece.actions)[0];
          const action = piece.actions[actionName];
          const message = resolveVariables(resolvedData.message || nextPayload.generatedText || '', nextPayload);
          const context = { payload: nextPayload, propsValue: { ...resolvedData, message, originalPlatform } };
          console.log(`[EXEC] Running ${piece.displayName} → ${action.displayName}`);
          const result = await action.run(context);
          nextPayload[nodeId] = result;
          await logStep(executionId, nodeId, nodeType, 'success', { message }, result);
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // LOGIC NODE — Scrape, code, etc.
      // ═══════════════════════════════════════════════════════════════════════
      else if (nodeType === 'logic' || resolvedData.nodeType === 'scrapeNode') {
        const logicType = resolvedData.nodeType || 'scrapeNode';
        if (logicType === 'scrapeNode') {
          const url = resolvedData.url || resolvedData.input || 'https://example.com';
          const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
          
          try {
            const response = await axios.post(`${backendUrl}/api/tools/scrape`, { url });
            nextPayload[nodeId] = response.data;
            await logStep(executionId, nodeId, nodeType, 'success', { url }, response.data);
          } catch (error: any) {
            console.error(`[EXEC] Scrape failed: ${error.message}`);
            await logStep(executionId, nodeId, nodeType, 'error', { url }, null, error.message);
          }
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // ROUTER / BRANCH NODE — Evaluate conditions, route to matching branches
      // ═══════════════════════════════════════════════════════════════════════
      else if (nodeType === 'routerNode') {
        const conditions = (resolvedData.conditions as any[]) || [];
        const mode = resolvedData.mode || 'first_match'; // 'first_match' | 'all_match'
        const connectedEdges = edges.filter(e => e.source === nodeId);
        let matchedBranches: string[] = [];

        for (let i = 0; i < connectedEdges.length; i++) {
          const edge = connectedEdges[i];
          const condition = conditions[i]; // Each branch has a condition
          if (!condition || evaluateCondition(condition, nextPayload)) {
            matchedBranches.push(edge.target);
            if (mode === 'first_match') break;
          }
        }

        // If no condition matched, use fallback (last branch)
        if (matchedBranches.length === 0 && connectedEdges.length > 0) {
          matchedBranches.push(connectedEdges[connectedEdges.length - 1].target);
        }

        console.log(`[EXEC] Router: ${matchedBranches.length} branch(es) matched`);
        await logStep(executionId, nodeId, nodeType, 'success', { conditions, mode }, { matchedBranches });

        for (const targetId of matchedBranches) {
          await enqueueNode(workflowId, targetId, nodes, edges, nextPayload, executionId);
        }
        return; // Don't use default downstream enqueue
      }

      // ═══════════════════════════════════════════════════════════════════════
      // LOOP NODE — Iterate over a list, execute body for each item
      // ═══════════════════════════════════════════════════════════════════════
      else if (nodeType === 'loopNode') {
        const listPath = resolvedData.listPath || resolvedData.list || '';
        let items: any[];

        // Try to resolve the list from payload or parse it directly
        if (typeof listPath === 'string' && listPath.startsWith('[')) {
          try { items = JSON.parse(listPath); } catch { items = []; }
        } else if (typeof listPath === 'string') {
          items = getNestedValue(nextPayload, listPath);
          if (!Array.isArray(items)) items = listPath.split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(listPath)) {
          items = listPath;
        } else {
          items = [];
        }

        const bodyEdge = edges.find(e => e.source === nodeId && e.sourceHandle === 'loop-body');
        const doneEdge = edges.find(e => e.source === nodeId && e.sourceHandle === 'loop-done');

        console.log(`[EXEC] Loop: iterating ${items.length} items`);
        await logStep(executionId, nodeId, nodeType, 'success', { listPath }, { itemCount: items.length });

        // Enqueue body node once per item
        if (bodyEdge) {
          for (let i = 0; i < items.length; i++) {
            const loopPayload = {
              ...nextPayload,
              _loop: { index: i, item: items[i], total: items.length },
              currentItem: items[i],
            };
            await enqueueNode(workflowId, bodyEdge.target, nodes, edges, loopPayload, executionId);
          }
        }

        // Enqueue "done" path after all iterations are queued
        if (doneEdge) {
          nextPayload._loop = { completed: true, total: items.length };
          await enqueueNode(workflowId, doneEdge.target, nodes, edges, nextPayload, executionId);
        }
        return; // Don't use default downstream enqueue
      }

      // ═══════════════════════════════════════════════════════════════════════
      // FILTER NODE — Continue only if condition passes
      // ═══════════════════════════════════════════════════════════════════════
      else if (nodeType === 'filterNode') {
        const condition = resolvedData.condition || resolvedData;
        const passes = evaluateCondition(condition, nextPayload);
        console.log(`[EXEC] Filter: ${passes ? 'PASS ✅' : 'BLOCK ❌'}`);
        await logStep(executionId, nodeId, nodeType, 'success', { condition }, { passes });

        const passEdge = edges.find(e => e.source === nodeId && e.sourceHandle === 'pass');
        const blockEdge = edges.find(e => e.source === nodeId && e.sourceHandle === 'block');

        if (passes && passEdge) {
          await enqueueNode(workflowId, passEdge.target, nodes, edges, nextPayload, executionId);
        } else if (!passes && blockEdge) {
          await enqueueNode(workflowId, blockEdge.target, nodes, edges, nextPayload, executionId);
        }
        // If no matching handle, try default edges
        if (!passEdge && !blockEdge) {
          if (passes) {
            const defaultEdges = edges.filter(e => e.source === nodeId);
            for (const edge of defaultEdges) {
              await enqueueNode(workflowId, edge.target, nodes, edges, nextPayload, executionId);
            }
          }
        }
        return; // Don't use default downstream enqueue
      }

      // ═══════════════════════════════════════════════════════════════════════
      // DELAY NODE — Wait X seconds/minutes/hours before continuing
      // ═══════════════════════════════════════════════════════════════════════
      else if (nodeType === 'delayNode') {
        const amount = Number(resolvedData.amount) || 5;
        const unit = resolvedData.unit || 'seconds';
        let delaySeconds = amount;
        if (unit === 'minutes') delaySeconds = amount * 60;
        else if (unit === 'hours') delaySeconds = amount * 3600;

        console.log(`[EXEC] Delay: waiting ${delaySeconds}s (${amount} ${unit})`);
        await logStep(executionId, nodeId, nodeType, 'success', { amount, unit }, { delaySeconds });

        // Enqueue downstream with delay
        const connectedEdges = edges.filter(e => e.source === nodeId);
        for (const edge of connectedEdges) {
          await enqueueNode(workflowId, edge.target, nodes, edges, nextPayload, executionId, delaySeconds);
        }
        return;
      }

      // ═══════════════════════════════════════════════════════════════════════
      // CODE NODE — Disabled for Security
      // ═══════════════════════════════════════════════════════════════════════
      else if (nodeType === 'codeNode') {
        console.error(`[EXEC] Code: CodeNode execution is disabled for security reasons.`);
        nextPayload[nodeId] = { error: 'Code execution is disabled for security reasons to prevent Remote Code Execution (RCE). Please use logic nodes instead.' };
        await logStep(executionId, nodeId, nodeType, 'error', null, null, 'Code execution is disabled to prevent RCE.');
      }

      // ═══════════════════════════════════════════════════════════════════════
      // HTTP REQUEST NODE — Make arbitrary API calls
      // ═══════════════════════════════════════════════════════════════════════
      else if (nodeType === 'httpNode') {
        const method = (resolvedData.method || 'GET').toUpperCase();
        const url = resolveVariables(resolvedData.url || '', nextPayload);
        let headers: Record<string, string> = {};
        let body: any = undefined;

        // Parse headers from string or object
        if (typeof resolvedData.headers === 'string') {
          try { headers = JSON.parse(resolvedData.headers); } catch {}
        } else if (resolvedData.headers) {
          headers = resolvedData.headers;
        }

        // Parse body
        if (resolvedData.body) {
          if (typeof resolvedData.body === 'string') {
            body = resolveVariables(resolvedData.body, nextPayload);
            try { body = JSON.parse(body); } catch {} // Try to parse as JSON
          } else {
            body = resolveObjectVariables(resolvedData.body, nextPayload);
          }
        }

        console.log(`[EXEC] HTTP ${method} ${url}`);
        try {
          const response = await axios({
            method: method.toLowerCase(),
            url,
            headers,
            data: body,
            timeout: 30000,
            validateStatus: () => true, // Don't throw on non-2xx
          });

          const result = {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers,
          };
          nextPayload[nodeId] = result;
          nextPayload._httpResponse = result;
          await logStep(executionId, nodeId, nodeType, 'success', { method, url }, { status: response.status, data: typeof response.data === 'string' ? response.data.slice(0, 500) : response.data });
        } catch (httpError: any) {
          console.error(`[EXEC] HTTP error:`, httpError.message);
          nextPayload[nodeId] = { error: httpError.message };
          await logStep(executionId, nodeId, nodeType, 'error', { method, url }, null, httpError.message);
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // STOP NODE — Terminate execution, do not enqueue downstream
      // ═══════════════════════════════════════════════════════════════════════
      else if (nodeType === 'stopNode') {
        const returnValue = resolvedData.returnValue || resolvedData.message || null;
        console.log(`[EXEC] ⏹ Stop: Execution terminated.`);
        await logStep(executionId, nodeId, nodeType, 'success', null, { stopped: true, returnValue });

        // Save final result to Firestore
        if (executionId) {
          try {
            await getDb().collection('executionLogs').doc(executionId).set({
              status: 'completed', finishedAt: admin.firestore.FieldValue.serverTimestamp(),
              result: returnValue, finalPayload: nextPayload,
            }, { merge: true });
          } catch {}
        }
        return; // ⏹ Do NOT enqueue any downstream nodes
      }

      // ═══════════════════════════════════════════════════════════════════════
      // UNKNOWN NODE TYPE — Log warning and pass through
      // ═══════════════════════════════════════════════════════════════════════
      else {
        console.warn(`[EXEC] Unknown node type: ${nodeType}, passing through`);
        await logStep(executionId, nodeId, nodeType, 'skipped', null, { reason: 'unknown type' });
      }

      // ─── Default: enqueue all downstream nodes ──────────────────────────
      const connectedEdges = edges.filter(e => e.source === nodeId);
      for (const edge of connectedEdges) {
        await enqueueNode(workflowId, edge.target, nodes, edges, nextPayload, executionId);
      }

    } catch (error: any) {
      console.error(`[EXEC] ❌ Error executing node ${nodeId}:`, error.message || error);
      await logStep(executionId, nodeId, nodeType, 'error', null, null, error.message || String(error));
      throw error; // Rethrow for retry
    }
  }
);

// ─── HTTP Trigger to Kick Off a Workflow ──────────────────────────────────────
export const triggerWorkflow = onRequest({ cors: true }, async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { nodes, edges, workflowName } = req.body;
    if (!nodes || !edges) {
      res.status(400).send({ error: 'Nodes and edges are required' });
      return;
    }

    const triggerNode = nodes.find((n: WorkflowNode) => n.type === 'triggerNode');
    if (!triggerNode) {
      res.status(400).send({ error: 'No trigger node found' });
      return;
    }

    const workflowId = `wf_${Date.now()}`;
    const executionId = `exec_${Date.now()}`;

    // Create execution log document
    await getDb().collection('executionLogs').doc(executionId).set({
      workflowId,
      workflowName: workflowName || 'Unnamed',
      status: 'running',
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      nodeCount: nodes.length,
    });

    // Enqueue the trigger node
    await enqueueNode(workflowId, triggerNode.id, nodes, edges, {}, executionId);

    res.status(200).send({
      success: true,
      message: 'Workflow execution started.',
      workflowId,
      executionId,
    });
  } catch (error: any) {
    console.error('[TRIGGER] Failed:', error.message || error);
    res.status(500).send({ error: error.message });
  }
});

// ─── Webhook Trigger Endpoint ────────────────────────────────────────────────
// Triggers a specific workflow ID. 
// Accepts POST/GET requests and passes body/query params into the trigger context.
export const webhookTrigger = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
  try {
    const workflowId = req.path.split('/').pop() || req.query.workflowId as string;
    
    if (!workflowId) {
      res.status(400).send({ error: 'Missing workflowId in path or query' });
      return;
    }

    const workflowDoc = await getDb().collection('workflows').doc(workflowId).get();
    if (!workflowDoc.exists) {
      res.status(404).send({ error: `Workflow ${workflowId} not found` });
      return;
    }

    const workflowData = workflowDoc.data();
    const nodes = workflowData?.nodes;
    const edges = workflowData?.edges;

    if (!nodes || !edges) {
      res.status(400).send({ error: 'Workflow has no valid nodes or edges' });
      return;
    }

    const triggerNode = nodes.find((n: WorkflowNode) => n.type === 'triggerNode');
    if (!triggerNode) {
      res.status(400).send({ error: 'Workflow has no trigger node' });
      return;
    }

    const executionId = `exec_${Date.now()}`;

    // Payload represents incoming data from the webhook
    const triggerPayload = {
      body: req.body,
      query: req.query,
      headers: req.headers,
    };

    // Create execution log document
    await getDb().collection('executionLogs').doc(executionId).set({
      workflowId,
      workflowName: workflowData?.name || 'Webhook Triggered Workflow',
      status: 'running',
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      nodeCount: nodes.length,
      triggerPayload
    });

    // Enqueue the trigger node
    await enqueueNode(workflowId, triggerNode.id, nodes, edges, triggerPayload, executionId);

    res.status(200).send({
      success: true,
      message: 'Webhook received. Workflow execution started.',
      workflowId,
      executionId,
    });
  } catch (error: any) {
    console.error('[WEBHOOK] Failed:', error.message || error);
    res.status(500).send({ error: error.message });
  }
});

// Define secrets using Firebase Secret Manager
import { defineSecret } from 'firebase-functions/params';
const bufferApiKey = defineSecret('BUFFER_API_KEY');

// ─── Buffer API Integration ──────────────────────────────────────────────────
export const bufferPost = onRequest({ cors: true, secrets: [bufferApiKey] }, async (req, res) => {
  try {
    const { platform, content } = req.body;
    
    // Securely use the API key from Google Cloud Secret Manager
    const bufferToken = bufferApiKey.value();
    
    // 1. Get organization ID
    const orgRes = await axios.post('https://api.buffer.com', 
      { query: '{ account { organizations { id } } }' },
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bufferToken}` } }
    );
    const orgId = orgRes.data.data?.account?.organizations?.[0]?.id;
    if (!orgId) throw new Error('Could not find Buffer organization');

    // 2. Get channels
    const channelsRes = await axios.post('https://api.buffer.com',
      { query: `{ channels(input: {organizationId: "${orgId}"}) { id name service } }` },
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bufferToken}` } }
    );
    const channels = channelsRes.data.data?.channels || [];
    
    // Match the requested platform, or post to all if 'all' or 'buffer' is specified
    const normalizedPlatform = platform?.toLowerCase() || '';
    let targetChannels = channels;
    if (normalizedPlatform !== 'all' && normalizedPlatform !== 'buffer') {
      const searchService = normalizedPlatform === 'x' ? 'twitter' : normalizedPlatform;
      targetChannels = channels.filter((c: any) => c.service.toLowerCase() === searchService);
    }
    
    if (targetChannels.length === 0) {
      targetChannels = channels; // fallback to all
    }
    if (targetChannels.length === 0) {
      throw new Error(`No connected Buffer channels found.`);
    }

    // 3. Post to channels
    const results: any[] = [];
    for (const channel of targetChannels) {
      const postRes = await axios.post('https://api.buffer.com',
        {
          query: `mutation CreatePost($input: CreatePostInput!) {
            createPost(input: $input) {
              __typename
            }
          }`,
          variables: {
            input: {
              channelId: channel.id,
              text: content || 'Hello from Social Workflow!',
              mode: "shareNow",
              needsApproval: false,
              schedulingType: "automatic",
              assets: []
            }
          }
        },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bufferToken}` } }
      );
      if (postRes.data.errors) {
        throw new Error(`Buffer API Error for ${channel.service}: ${postRes.data.errors[0].message}`);
      }
      results.push({ channel: channel.service, result: postRes.data.data });
    }
    
    res.status(200).send({ success: true, results });
  } catch (error: any) {
    console.error('[BUFFER] Failed:', error.message || error);
    res.status(500).send({ error: error.message });
  }
});

// ─── Telegram API Integration ────────────────────────────────────────────────
export const telegramPost = onRequest({ cors: true }, async (req, res) => {
  try {
    const { content, botToken, chatId } = req.body;
    
    // Securely use the API key from environment, with fallback provided by user
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
    const chat = chatId || process.env.TELEGRAM_CHAT_ID;
    
    if (!token) throw new Error('Telegram botToken is required.');
    if (!chat) throw new Error('Telegram chatId is required.');
    if (!content) throw new Error('Content is required to post.');

    const bot = new (await import('node-telegram-bot-api')).default(token, { polling: false });
    const result = await bot.sendMessage(chat, content);

    res.status(200).send({ success: true, result });
  } catch (error: any) {
    console.error('[TELEGRAM] Failed:', error.message || error);
    res.status(500).send({ error: error.message });
  }
});

// ─── Discord API Integration ────────────────────────────────────────────────
export const discordPost = onRequest({ cors: true }, async (req, res) => {
  try {
    const { content, botToken, channelId } = req.body;
    
    const token = botToken || process.env.DISCORD_BOT_TOKEN;
    const channel = channelId || process.env.DISCORD_CHANNEL_ID;
    
    if (!token) throw new Error('Discord botToken is required.');
    if (!channel) throw new Error('Discord channelId is required.');
    if (!content) throw new Error('Content is required to post.');

    const response = await axios.post(
      `https://discord.com/api/v10/channels/${channel}/messages`,
      { content },
      {
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    res.status(200).send({ success: true, result: response.data });
  } catch (error: any) {
    console.error('[DISCORD] Failed:', error.response?.data || error.message || error);
    res.status(500).send({ error: error.response?.data?.message || error.message });
  }
});

// ─── Reddit API Integration ────────────────────────────────────────────────
export const redditPost = onRequest({ cors: true }, async (req, res) => {
  try {
    const { content, clientId, clientSecret, username, password, subreddit } = req.body;
    
    if (!clientId || !clientSecret || !username || !password) {
      throw new Error('Reddit credentials missing (clientId, clientSecret, username, password).');
    }
    const targetSub = subreddit || 'test';

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SocialWorkflow/1.0'
        }
      }
    );
    
    const accessToken = tokenRes.data.access_token;
    if (!accessToken) throw new Error('Failed to obtain Reddit access token.');

    let title = content.split('\n')[0].substring(0, 300);
    if (title.length < 3) title = 'Social Workflow Auto-Post';
    
    const params = new URLSearchParams();
    params.append('sr', targetSub);
    params.append('kind', 'self');
    params.append('title', title);
    params.append('text', content);

    const response = await axios.post(
      'https://oauth.reddit.com/api/submit',
      params.toString(),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SocialWorkflow/1.0'
        }
      }
    );

    res.status(200).send({ success: true, result: response.data });
  } catch (error: any) {
    console.error('[REDDIT] Failed:', error.response?.data || error.message || error);
    res.status(500).send({ error: error.response?.data?.message || error.message });
  }
});
