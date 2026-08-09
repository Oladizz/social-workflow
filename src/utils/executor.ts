import { useConnectionsStore } from '../store/useConnectionsStore';
import { useExecutionStore, StepStatus } from '../store/useExecutionStore';

export async function executeWorkflow(
  runId: string,
  nodes: any[],
  edges: any[],
  onStepStart: (stepId: string) => void,
  onStepComplete: (stepId: string, status: StepStatus, output?: any, error?: string) => void
) {
  // Simple executor: Find root node (trigger), and follow edges
  const triggerNode = nodes.find(n => n.type === 'triggerNode');
  if (!triggerNode) {
    throw new Error('No trigger node found in workflow.');
  }

  let currentNodeId: string | null = triggerNode.id;
  
  while (currentNodeId) {
    const node = nodes.find(n => n.id === currentNodeId);
    if (!node) break;

    onStepStart(node.id);
    let output: any = null;
    let error: string | undefined = undefined;
    let status: StepStatus = 'success';

    try {
      if (node.type === 'actionNode') {
        const platform = node.data.platform;
        const action = node.data.selectedAction || 'post'; // Default to post if not set
        const inputData = node.data.actionInput || {};

        const normalizedPlatform = platform?.toLowerCase() || '';

        if (['twitter', 'x', 'youtube', 'linkedin', 'buffer', 'all'].includes(normalizedPlatform)) {
          // Use the secure backend Cloud Function for Buffer API operations
          const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-my-portfolio-7cd72.cloudfunctions.net';
          
          const content = inputData.content || node.data.message || 'Hello from Social Workflow!';
          
          const response = await fetch(`${functionsUrl}/bufferPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform: normalizedPlatform,
              content: content
            })
          });
          
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Buffer Cloud Function failed with status ${response.status}`);
          }
          
          output = await response.json();
        } else if (normalizedPlatform === 'gmail') {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
          let endpoint = '/api/gmail/draft';
          
          let payload = {
            to: inputData.to || 'test@example.com',
            subject: inputData.subject || 'Automated Email',
            body: inputData.body || inputData.content || node.data.message || 'Hello from Social Workflow!'
          };

          const response = await fetch(`${backendUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) throw new Error('Gmail API failed');
          output = await response.json();
        } else if (normalizedPlatform === 'telegram') {
          const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-my-portfolio-7cd72.cloudfunctions.net';
          let payload = {
            content: inputData.content || node.data.message || 'Hello from Social Workflow!',
            botToken: inputData.botToken || undefined,
            chatId: inputData.chatId || undefined
          };

          const response = await fetch(`${functionsUrl}/telegramPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Telegram Cloud Function failed with status ${response.status}`);
          }
          
          output = await response.json();
        } else if (normalizedPlatform === 'discord') {
          const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-my-portfolio-7cd72.cloudfunctions.net';
          let payload = {
            content: inputData.content || node.data.message || 'Hello from Social Workflow!',
            botToken: inputData.botToken || undefined,
            channelId: inputData.channelId || undefined
          };

          const response = await fetch(`${functionsUrl}/discordPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Discord Cloud Function failed with status ${response.status}`);
          }
          
          output = await response.json();
        } else if (normalizedPlatform === 'reddit') {
          const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-my-portfolio-7cd72.cloudfunctions.net';
          let payload = {
            content: inputData.content || node.data.message || 'Hello from Social Workflow!',
            clientId: inputData.clientId || undefined,
            clientSecret: inputData.clientSecret || undefined,
            username: inputData.username || undefined,
            password: inputData.password || undefined,
            subreddit: inputData.subreddit || undefined
          };

          const response = await fetch(`${functionsUrl}/redditPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Reddit Cloud Function failed with status ${response.status}`);
          }
          
          output = await response.json();
        } else {
          // Independent API placeholder for other platforms (Facebook, Instagram, etc.)
          await new Promise(resolve => setTimeout(resolve, 1000));
          output = { message: `Simulated independent API action for ${platform}` };
        }
      } else if (node.type === 'logic' && node.data.nodeType === 'scrapeNode') {
        const url = node.data.url || node.data.input || 'https://example.com';
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(`${backendUrl}/api/tools/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        if (!response.ok) throw new Error('Scraping failed');
        output = await response.json();
      } else if (node.type === 'delayNode') {
        const ms = (node.data.delayMs || 1000) as number;
        await new Promise(resolve => setTimeout(resolve, ms));
        output = { message: `Delayed for ${ms}ms` };
      } else {
        // Other node types (Trigger, AI, etc.) - simple simulation
        await new Promise(resolve => setTimeout(resolve, 500));
        output = { message: `Executed ${node.type}` };
      }
    } catch (err: any) {
      status = 'error';
      error = err.message || 'Execution failed';
    }

    onStepComplete(node.id, status, output ?? null, error ?? null);

    if (status === 'error') {
      break; // Stop execution on error
    }

    // Find next node
    const outgoingEdges = edges.filter(e => e.source === currentNodeId);
    if (outgoingEdges.length > 0) {
      // Simplistic: just take the first connection
      currentNodeId = outgoingEdges[0].target;
    } else {
      currentNodeId = null; // End of workflow
    }
  }
}
