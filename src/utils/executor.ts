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
        const action = node.data.selectedAction;
        const inputData = node.data.actionInput || {};

        if (platform === 'twitter') {
          // Get connection credentials
          const connection = useConnectionsStore.getState().getConnectionForPlatform('twitter');
          if (!connection) {
            throw new Error('No Twitter connection found. Please add one in Integrations.');
          }

          // In this demo, we expect the credentials to contain email, username, and password
          const { apiKey: username, apiSecret: password } = connection.credentials;
          // Note: for this MVP we reuse apiSecret for password. Ideally we'd have explicit fields.
          const email = username; // Placeholder. Usually twikit needs all three.
          
          let endpoint = '';
          let payload: any = {
            username: username,
            email: email,
            password: password
          };

          if (action === 'post_tweet') {
            endpoint = '/api/twitter/post';
            payload.text = inputData.content || 'Hello from Social Workflow!';
          } else if (action === 'reply_tweet') {
            endpoint = '/api/twitter/reply';
            payload.tweet_id = inputData.tweet_id;
            payload.text = inputData.content;
          } else if (action === 'like_tweet') {
            endpoint = '/api/twitter/like';
            payload.tweet_id = inputData.tweet_id;
          } else if (action === 'retweet') {
            endpoint = '/api/twitter/retweet';
            payload.tweet_id = inputData.tweet_id;
          } else if (action === 'send_dm') {
            endpoint = '/api/twitter/dm';
            payload.target_username = inputData.username;
            payload.text = inputData.content;
          } else {
             throw new Error('Unsupported Twitter action');
          }

          const response = await fetch(`http://localhost:8000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.detail || 'Failed to execute Twitter action');
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

    onStepComplete(node.id, status, output, error);

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
