import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { WorkflowNode, WorkflowEdge } from './types';

import { getDb } from './db';

export const cronRunner = onSchedule('every 1 minutes', async (event) => {
  console.log('[SCHEDULER] Running master cron job...');

  // Dynamically import enqueueNode to avoid circular dependency
  const { enqueueNode } = await import('./index');

  try {
    const workflowsSnapshot = await getDb().collection('workflows').get();
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentHour = now.getHours();
    
    for (const doc of workflowsSnapshot.docs) {
      const workflowData = doc.data();
      const nodes: WorkflowNode[] = workflowData.nodes || [];
      const edges: WorkflowEdge[] = workflowData.edges || [];
      
      const triggerNode = nodes.find(n => n.type === 'triggerNode');
      if (!triggerNode) continue;
      
      const triggerType = triggerNode.data?.triggerType;
      
      if (triggerType === 'schedule') {
        const freq = triggerNode.data.scheduleFreq || 'daily';
        const time = triggerNode.data.scheduleTime || '09:00';
        
        let shouldRun = false;
        
        if (freq === 'minute') shouldRun = true;
        else if (freq === 'hourly' && currentMinute === 0) shouldRun = true;
        else if (freq === 'daily') {
          const [h, m] = time.split(':').map(Number);
          if (currentHour === h && currentMinute === m) shouldRun = true;
        }
        // weekly, monthly could be implemented similarly
        
        if (shouldRun) {
           await runWorkflow(doc.id, workflowData, enqueueNode);
        }
      } 
      else if (triggerType === 'rss') {
        // Polling an RSS feed
        // Only run RSS checks every 20 minutes to save bandwidth, as requested.
        if (currentMinute % 20 !== 0) continue;

        const feedUrl = triggerNode.data.rssUrl;
        if (!feedUrl) continue;
        
        try {
          const response = await axios.get(feedUrl, { timeout: 10000 });
          const $ = cheerio.load(response.data, { xmlMode: true });
          const firstItem = $('item').first();
          const title = firstItem.find('title').text();
          const link = firstItem.find('link').text();
          const pubDate = firstItem.find('pubDate').text();
          
          // Check if this is a new item
          const lastGuid = triggerNode.data._lastRssGuid;
          const currentGuid = firstItem.find('guid').text() || link;
          
          if (currentGuid && currentGuid !== lastGuid) {
            console.log(`[RSS] New item found for workflow ${doc.id}: ${title}`);
            
            // Save the new guid so we don't trigger again
            triggerNode.data._lastRssGuid = currentGuid;
            await getDb().collection('workflows').doc(doc.id).update({ nodes });
            
            // Run workflow with payload
            await runWorkflow(doc.id, workflowData, enqueueNode, {
              rss: { title, link, pubDate, guid: currentGuid }
            });
          }
        } catch (e: any) {
          console.error(`[RSS] Failed to fetch feed for workflow ${doc.id}: ${e.message}`);
        }
      }
    }
  } catch (error) {
    console.error('[SCHEDULER] Failed:', error);
  }
});

async function runWorkflow(workflowId: string, workflowData: any, enqueueNodeFn: any, payload: any = {}) {
  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const nodes = workflowData.nodes;
  const edges = workflowData.edges;
  const triggerNode = nodes.find((n: WorkflowNode) => n.type === 'triggerNode');
  
  if (!triggerNode) return;
  
  console.log(`[SCHEDULER] Starting workflow ${workflowId} (${workflowData.name})`);
  
  await getDb().collection('executionLogs').doc(executionId).set({
    workflowId,
    workflowName: workflowData.name || 'Scheduled Workflow',
    status: 'running',
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    nodeCount: nodes.length,
    triggerPayload: payload
  });

  await enqueueNodeFn(workflowId, triggerNode.id, nodes, edges, payload, executionId);
}
