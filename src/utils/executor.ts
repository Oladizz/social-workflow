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
          // Use Buffer API for X, YouTube, LinkedIn, or if 'all'/'buffer' is specified
          const bufferToken = import.meta.env.VITE_BUFFER_API_KEY || 'N5YGSt1hQeD8ektOYIKzWMmZgl7XBy7N3-lqjoAfJd2';
          
          // 1. Get organization ID
          const orgRes = await fetch('https://api.buffer.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bufferToken}` },
            body: JSON.stringify({ query: '{ account { organizations { id } } }' })
          });
          const orgData = await orgRes.json();
          const orgId = orgData.data?.account?.organizations?.[0]?.id;
          
          if (!orgId) throw new Error('Could not find Buffer organization');

          // 2. Get channels
          const channelsRes = await fetch('https://api.buffer.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bufferToken}` },
            body: JSON.stringify({ query: `{ channels(input: {organizationId: "${orgId}"}) { id name service } }` })
          });
          const channelsData = await channelsRes.json();
          const channels = channelsData.data?.channels || [];
          
          // Match the requested platform, or post to all if 'all' or 'buffer' is specified
          let targetChannels = channels;
          if (normalizedPlatform !== 'all' && normalizedPlatform !== 'buffer') {
            // Map 'x' to 'twitter' for Buffer
            const searchService = normalizedPlatform === 'x' ? 'twitter' : normalizedPlatform;
            targetChannels = channels.filter((c: any) => c.service.toLowerCase() === searchService);
          }
          
          if (targetChannels.length === 0) {
            // If the specific platform isn't found in Buffer, fallback to posting to all available channels
            targetChannels = channels;
          }

          if (targetChannels.length === 0) {
            throw new Error(`No connected Buffer channels found.`);
          }

          // 3. Post to channels
          const content = inputData.content || node.data.message || 'Hello from Social Workflow!';
          
          const results = [];
          for (const channel of targetChannels) {
            const postRes = await fetch('https://api.buffer.com', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bufferToken}` },
              body: JSON.stringify({
                query: `mutation CreatePost($input: CreatePostInput!) {
                  createPost(input: $input) {
                    __typename
                  }
                }`,
                variables: {
                  input: {
                    channelId: channel.id,
                    text: content,
                    mode: "shareNow",
                    needsApproval: false,
                    schedulingType: "automatic",
                    assets: []
                  }
                }
              })
            });
            const postData = await postRes.json();
            if (postData.errors) {
              throw new Error(`Buffer API Error for ${channel.service}: ${postData.errors[0].message}`);
            }
            results.push({ channel: channel.service, result: postData.data });
          }
          
          output = { message: `Posted via Buffer to ${targetChannels.length} channels`, results };
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
        } else {
          // Independent API placeholder for other platforms (Reddit, Discord, Telegram, etc.)
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
