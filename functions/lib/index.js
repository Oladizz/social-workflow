"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookTrigger = exports.triggerWorkflow = exports.executeNodeTask = void 0;
exports.enqueueNode = enqueueNode;
const https_1 = require("firebase-functions/v2/https");
const tasks_1 = require("firebase-functions/v2/tasks");
const functions_1 = require("firebase-admin/functions");
const pieces_1 = require("./pieces");
const admin = __importStar(require("firebase-admin"));
const db_1 = require("./db");
__exportStar(require("./scheduler"), exports);
const axios_1 = __importDefault(require("axios"));
// ─── Variable Resolver Engine ─────────────────────────────────────────────────
// Replaces {{nodeId.property}} expressions with actual runtime values from the
// execution context. Supports deep paths like {{node_1.response.data.name}}.
function resolveVariables(template, context) {
    if (typeof template !== 'string')
        return template;
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const parts = path.trim().split('.');
        let value = context;
        for (const part of parts) {
            if (value == null)
                return match; // Leave unresolved if path doesn't exist
            value = value[part];
        }
        if (value === undefined || value === null)
            return match;
        return typeof value === 'object' ? JSON.stringify(value) : String(value);
    });
}
// Recursively resolve all string values in an object
function resolveObjectVariables(obj, context) {
    if (typeof obj === 'string')
        return resolveVariables(obj, context);
    if (Array.isArray(obj))
        return obj.map(item => resolveObjectVariables(item, context));
    if (obj && typeof obj === 'object') {
        const resolved = {};
        for (const [key, val] of Object.entries(obj)) {
            resolved[key] = resolveObjectVariables(val, context);
        }
        return resolved;
    }
    return obj;
}
// ─── Condition Evaluator ──────────────────────────────────────────────────────
// Evaluates simple conditions like: { field: "status", operator: "equals", value: "active" }
function evaluateCondition(condition, payload) {
    if (!condition)
        return true;
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
            try {
                return new RegExp(String(value)).test(String(fieldValue));
            }
            catch (_a) {
                return false;
            }
        default:
            return true;
    }
}
function getNestedValue(obj, path) {
    if (!path)
        return obj;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
        if (current == null)
            return undefined;
        current = current[part];
    }
    return current;
}
// ─── Enqueue Helper ───────────────────────────────────────────────────────────
// Enqueue a node execution using Firebase Cloud Tasks.
async function enqueueNode(workflowId, nodeId, nodes, edges, payload, executionId, delaySeconds) {
    const queue = (0, functions_1.getFunctions)().taskQueue('executeNodeTask');
    const taskData = { workflowId, nodeId, nodes, edges, payload, executionId };
    if (delaySeconds && delaySeconds > 0) {
        const scheduleTime = new Date(Date.now() + delaySeconds * 1000);
        await queue.enqueue(taskData, { scheduleTime });
    }
    else {
        await queue.enqueue(taskData);
    }
}
// ─── Log Execution Step to Firestore ──────────────────────────────────────────
async function logStep(executionId, nodeId, nodeType, status, input, output, error) {
    try {
        await (0, db_1.getDb)().collection('executionLogs').doc(executionId).collection('steps').doc(nodeId).set({
            nodeId, nodeType, status, input, output, error,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    catch (e) {
        console.warn(`[LOG] Failed to log step ${nodeId}:`, e);
    }
}
// ─── Task Queue Handler ──────────────────────────────────────────────────────
exports.executeNodeTask = (0, tasks_1.onTaskDispatched)({
    retryConfig: { maxAttempts: 3, minBackoffSeconds: 30 },
    rateLimits: { maxConcurrentDispatches: 20 },
}, async (req) => {
    const { workflowId, nodeId, nodes, edges, payload = {}, executionId = '' } = req.data;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
        console.error(`[EXEC] Node ${nodeId} not found in workflow ${workflowId}`);
        return;
    }
    const nodeType = node.type || '';
    console.log(`[EXEC] ▶ Node ${node.id} (${nodeType})`);
    let nextPayload = Object.assign({}, payload);
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
            const context = { payload: nextPayload, propsValue: Object.assign(Object.assign({}, resolvedData), { prompt }) };
            // Map AI task to the correct piece and action
            let pieceName = provider;
            let actionName = 'generate_content'; // default
            // Utility AI tasks (sentiment, classify, extract, etc.) use the ai_utils piece
            const utilityTasks = ['sentiment', 'classify', 'extract', 'summarize', 'translate'];
            if (utilityTasks.includes(aiTask)) {
                pieceName = 'ai_utils';
                const taskMap = {
                    sentiment: 'sentiment_analysis',
                    classify: 'classify_text',
                    extract: 'extract_entities',
                    summarize: 'summarize_text',
                    translate: 'translate_text',
                };
                actionName = taskMap[aiTask] || 'sentiment_analysis';
            }
            else {
                // Provider-specific task mapping
                const taskActionMap = {
                    generate: provider === 'gemini' ? 'generate_content' : 'generate_text',
                    chat: 'chat_conversation',
                    vision: 'vision_analyze',
                    transcribe: 'transcribe_audio',
                    tts: 'text_to_speech',
                };
                actionName = taskActionMap[aiTask] || (provider === 'gemini' ? 'generate_content' : 'generate_text');
            }
            const piece = (0, pieces_1.getPiece)(pieceName);
            if (piece && piece.actions[actionName]) {
                console.log(`[EXEC] AI: ${piece.displayName} → ${piece.actions[actionName].displayName}`);
                const result = await piece.actions[actionName].run(context);
                // Merge results into payload
                if (result.generatedText)
                    nextPayload.generatedText = result.generatedText;
                if (result._chatHistory)
                    nextPayload._chatHistory = result._chatHistory;
                nextPayload[nodeId] = result;
                await logStep(executionId, nodeId, nodeType, 'success', { provider, aiTask, prompt: prompt.slice(0, 200) }, result);
            }
            else {
                console.warn(`[EXEC] AI piece "${pieceName}" or action "${actionName}" not found`);
                await logStep(executionId, nodeId, nodeType, 'error', null, null, `Piece "${pieceName}" action "${actionName}" not found`);
            }
        }
        // ═══════════════════════════════════════════════════════════════════════
        // ACTION NODE — Execute platform piece (Twitter, LinkedIn, etc.)
        // ═══════════════════════════════════════════════════════════════════════
        else if (nodeType === 'actionNode') {
            const platform = resolvedData.platform;
            const piece = (0, pieces_1.getPiece)(platform);
            if (!piece) {
                console.warn(`[EXEC] Piece "${platform}" not found.`);
                await logStep(executionId, nodeId, nodeType, 'error', null, null, `Piece "${platform}" not found`);
            }
            else {
                const actionName = Object.keys(piece.actions)[0];
                const action = piece.actions[actionName];
                const message = resolveVariables(resolvedData.message || nextPayload.generatedText || '', nextPayload);
                const context = { payload: nextPayload, propsValue: Object.assign(Object.assign({}, resolvedData), { message }) };
                console.log(`[EXEC] Running ${piece.displayName} → ${action.displayName}`);
                const result = await action.run(context);
                nextPayload[nodeId] = result;
                await logStep(executionId, nodeId, nodeType, 'success', { message }, result);
            }
        }
        // ═══════════════════════════════════════════════════════════════════════
        // ROUTER / BRANCH NODE — Evaluate conditions, route to matching branches
        // ═══════════════════════════════════════════════════════════════════════
        else if (nodeType === 'routerNode') {
            const conditions = resolvedData.conditions || [];
            const mode = resolvedData.mode || 'first_match'; // 'first_match' | 'all_match'
            const connectedEdges = edges.filter(e => e.source === nodeId);
            let matchedBranches = [];
            for (let i = 0; i < connectedEdges.length; i++) {
                const edge = connectedEdges[i];
                const condition = conditions[i]; // Each branch has a condition
                if (!condition || evaluateCondition(condition, nextPayload)) {
                    matchedBranches.push(edge.target);
                    if (mode === 'first_match')
                        break;
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
            let items;
            // Try to resolve the list from payload or parse it directly
            if (typeof listPath === 'string' && listPath.startsWith('[')) {
                try {
                    items = JSON.parse(listPath);
                }
                catch (_a) {
                    items = [];
                }
            }
            else if (typeof listPath === 'string') {
                items = getNestedValue(nextPayload, listPath);
                if (!Array.isArray(items))
                    items = listPath.split(',').map(s => s.trim()).filter(Boolean);
            }
            else if (Array.isArray(listPath)) {
                items = listPath;
            }
            else {
                items = [];
            }
            const bodyEdge = edges.find(e => e.source === nodeId && e.sourceHandle === 'loop-body');
            const doneEdge = edges.find(e => e.source === nodeId && e.sourceHandle === 'loop-done');
            console.log(`[EXEC] Loop: iterating ${items.length} items`);
            await logStep(executionId, nodeId, nodeType, 'success', { listPath }, { itemCount: items.length });
            // Enqueue body node once per item
            if (bodyEdge) {
                for (let i = 0; i < items.length; i++) {
                    const loopPayload = Object.assign(Object.assign({}, nextPayload), { _loop: { index: i, item: items[i], total: items.length }, currentItem: items[i] });
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
            }
            else if (!passes && blockEdge) {
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
            if (unit === 'minutes')
                delaySeconds = amount * 60;
            else if (unit === 'hours')
                delaySeconds = amount * 3600;
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
        // CODE NODE — Execute user JavaScript in a sandboxed Function
        // ═══════════════════════════════════════════════════════════════════════
        else if (nodeType === 'codeNode') {
            const code = resolvedData.code || resolvedData.script || '';
            console.log(`[EXEC] Code: executing ${code.length} chars of JS`);
            try {
                // Create a sandboxed function with access to payload and utility helpers
                const sandbox = new Function('payload', 'console', `
            "use strict";
            const inputs = payload;
            ${code}
          `);
                const logs = [];
                const sandboxConsole = {
                    log: (...args) => logs.push(args.map(String).join(' ')),
                    warn: (...args) => logs.push('[WARN] ' + args.map(String).join(' ')),
                    error: (...args) => logs.push('[ERROR] ' + args.map(String).join(' ')),
                };
                const result = sandbox(nextPayload, sandboxConsole);
                // If the code returns a value, merge it into payload
                if (result && typeof result === 'object') {
                    Object.assign(nextPayload, result);
                }
                nextPayload[nodeId] = { result, logs };
                await logStep(executionId, nodeId, nodeType, 'success', { code: code.slice(0, 200) }, { result, logs });
            }
            catch (codeError) {
                console.error(`[EXEC] Code execution error:`, codeError.message);
                nextPayload[nodeId] = { error: codeError.message };
                await logStep(executionId, nodeId, nodeType, 'error', { code: code.slice(0, 200) }, null, codeError.message);
            }
        }
        // ═══════════════════════════════════════════════════════════════════════
        // HTTP REQUEST NODE — Make arbitrary API calls
        // ═══════════════════════════════════════════════════════════════════════
        else if (nodeType === 'httpNode') {
            const method = (resolvedData.method || 'GET').toUpperCase();
            const url = resolveVariables(resolvedData.url || '', nextPayload);
            let headers = {};
            let body = undefined;
            // Parse headers from string or object
            if (typeof resolvedData.headers === 'string') {
                try {
                    headers = JSON.parse(resolvedData.headers);
                }
                catch (_b) { }
            }
            else if (resolvedData.headers) {
                headers = resolvedData.headers;
            }
            // Parse body
            if (resolvedData.body) {
                if (typeof resolvedData.body === 'string') {
                    body = resolveVariables(resolvedData.body, nextPayload);
                    try {
                        body = JSON.parse(body);
                    }
                    catch (_c) { } // Try to parse as JSON
                }
                else {
                    body = resolveObjectVariables(resolvedData.body, nextPayload);
                }
            }
            console.log(`[EXEC] HTTP ${method} ${url}`);
            try {
                const response = await (0, axios_1.default)({
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
            }
            catch (httpError) {
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
                    await (0, db_1.getDb)().collection('executionLogs').doc(executionId).set({
                        status: 'completed', finishedAt: admin.firestore.FieldValue.serverTimestamp(),
                        result: returnValue, finalPayload: nextPayload,
                    }, { merge: true });
                }
                catch (_d) { }
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
    }
    catch (error) {
        console.error(`[EXEC] ❌ Error executing node ${nodeId}:`, error.message || error);
        await logStep(executionId, nodeId, nodeType, 'error', null, null, error.message || String(error));
        throw error; // Rethrow for retry
    }
});
// ─── HTTP Trigger to Kick Off a Workflow ──────────────────────────────────────
exports.triggerWorkflow = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
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
        const triggerNode = nodes.find((n) => n.type === 'triggerNode');
        if (!triggerNode) {
            res.status(400).send({ error: 'No trigger node found' });
            return;
        }
        const workflowId = `wf_${Date.now()}`;
        const executionId = `exec_${Date.now()}`;
        // Create execution log document
        await (0, db_1.getDb)().collection('executionLogs').doc(executionId).set({
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
    }
    catch (error) {
        console.error('[TRIGGER] Failed:', error.message || error);
        res.status(500).send({ error: error.message });
    }
});
// ─── Webhook Trigger Endpoint ────────────────────────────────────────────────
// Triggers a specific workflow ID. 
// Accepts POST/GET requests and passes body/query params into the trigger context.
exports.webhookTrigger = (0, https_1.onRequest)({ cors: true, maxInstances: 10 }, async (req, res) => {
    try {
        const workflowId = req.path.split('/').pop() || req.query.workflowId;
        if (!workflowId) {
            res.status(400).send({ error: 'Missing workflowId in path or query' });
            return;
        }
        const workflowDoc = await (0, db_1.getDb)().collection('workflows').doc(workflowId).get();
        if (!workflowDoc.exists) {
            res.status(404).send({ error: `Workflow ${workflowId} not found` });
            return;
        }
        const workflowData = workflowDoc.data();
        const nodes = workflowData === null || workflowData === void 0 ? void 0 : workflowData.nodes;
        const edges = workflowData === null || workflowData === void 0 ? void 0 : workflowData.edges;
        if (!nodes || !edges) {
            res.status(400).send({ error: 'Workflow has no valid nodes or edges' });
            return;
        }
        const triggerNode = nodes.find((n) => n.type === 'triggerNode');
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
        await (0, db_1.getDb)().collection('executionLogs').doc(executionId).set({
            workflowId,
            workflowName: (workflowData === null || workflowData === void 0 ? void 0 : workflowData.name) || 'Webhook Triggered Workflow',
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
    }
    catch (error) {
        console.error('[WEBHOOK] Failed:', error.message || error);
        res.status(500).send({ error: error.message });
    }
});
//# sourceMappingURL=index.js.map