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

        if (platform === 'twitter') {
          // Get connection credentials
          const connection = useConnectionsStore.getState().getConnectionForPlatform('twitter');
          if (!connection) {
            throw new Error('No Twitter connection found. Please add one in Integrations.');
          }

          const { apiKey, apiSecret, twitterEmail, accessTokenSecret } = connection.credentials;
          
          let endpoint = '';
          let payload: any = {
            api_key: apiKey,
            api_secret: apiSecret,
            access_token: twitterEmail,
            access_token_secret: accessTokenSecret
          };

          if (action === 'tweet' || action === 'post') {
            endpoint = '/api/twitter/post';
            payload.text = inputData.content || node.data.message || 'Hello from Social Workflow!';
          } else if (action === 'reply') {
            endpoint = '/api/twitter/reply';
            payload.tweet_id = inputData.tweet_id || node.data.message;
            payload.text = inputData.content || node.data.message;
          } else if (action === 'like') {
            endpoint = '/api/twitter/like';
            payload.tweet_id = inputData.tweet_id || node.data.message;
          } else if (action === 'retweet') {
            endpoint = '/api/twitter/retweet';
            payload.tweet_id = inputData.tweet_id || node.data.message;
          } else if (action === 'dm') {
            endpoint = '/api/twitter/dm';
            payload.target_username = inputData.username || node.data.message;
            payload.text = inputData.content || node.data.message;
          } else {
             throw new Error(`Unsupported Twitter action: ${action}`);
          }

          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
          let response;
          try {
            response = await fetch(`${backendUrl}${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } catch (e: any) {
            throw new Error(`Network error connecting to backend: ${e.message}`);
          }

          let data;
          const textResponse = await response.text();
          try {
            data = JSON.parse(textResponse);
          } catch (e) {
            throw new Error(`Server returned non-JSON response (${response.status}): ${textResponse.slice(0, 150)}...`);
          }

          if (!response.ok) {
            let errorMsg = 'Failed to execute Twitter action';
            if (data.detail) {
              errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
            } else if (data.message) {
              errorMsg = data.message;
            }
            throw new Error(`Backend Error (${response.status}): ${errorMsg}`);
          }
          output = data;
        } else {
          // Placeholder for other platforms
          await new Promise(resolve => setTimeout(resolve, 1000));
          output = { message: `Simulated action for ${platform}` };
        }
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
