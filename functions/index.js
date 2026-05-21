const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

// Mock Handlers for Social Platforms
const postToPlatform = async (platform, message) => {
  console.log(`[EXECUTION] Emulating post to ${platform.toUpperCase()}: "${message}"`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, timestamp: new Date().toISOString() };
};

// Execution Engine Logic
const traverseAndExecute = async (nodes, edges, startNodeId) => {
  const executionLogs = [];
  let currentNodeId = startNodeId;
  
  while (currentNodeId) {
    const node = nodes.find(n => n.id === currentNodeId);
    if (!node) break;
    
    executionLogs.push(`Executing node: ${node.id} (${node.type})`);
    
    if (node.type === 'actionNode') {
      const platform = node.data.platform;
      const message = node.data.message;
      try {
        const result = await postToPlatform(platform, message);
        executionLogs.push(`Success: Posted to ${platform}`);
      } catch (error) {
        executionLogs.push(`Error: Failed to post to ${platform} - ${error.message}`);
      }
    }
    
    // Find next node
    const edge = edges.find(e => e.source === currentNodeId);
    currentNodeId = edge ? edge.target : null;
  }
  
  return executionLogs;
};

// HTTP Function to execute workflow manually
exports.executeWorkflow = onRequest(async (req, res) => {
  // CORS wrapper
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.status(204).send('');
    return;
  }

  try {
    // In a real app, we'd fetch the workflow from Firestore
    // For this prototype, we'll accept the workflow graph in the request body
    const { nodes, edges } = req.body;
    
    if (!nodes || !edges) {
      res.status(400).send({ error: 'Nodes and edges are required' });
      return;
    }

    // Find the trigger node
    const triggerNode = nodes.find(n => n.type === 'triggerNode');
    if (!triggerNode) {
      res.status(400).send({ error: 'No trigger node found' });
      return;
    }

    const logs = await traverseAndExecute(nodes, edges, triggerNode.id);
    
    res.status(200).send({ success: true, logs });
  } catch (error) {
    console.error('Workflow execution failed:', error);
    res.status(500).send({ error: error.message });
  }
});
