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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronRunner = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const db_1 = require("./db");
exports.cronRunner = (0, scheduler_1.onSchedule)('every 1 minutes', async (event) => {
    var _a;
    console.log('[SCHEDULER] Running master cron job...');
    // Dynamically import enqueueNode to avoid circular dependency
    const { enqueueNode } = await Promise.resolve().then(() => __importStar(require('./index')));
    try {
        const workflowsSnapshot = await (0, db_1.getDb)().collection('workflows').get();
        const now = new Date();
        const currentMinute = now.getMinutes();
        const currentHour = now.getHours();
        for (const doc of workflowsSnapshot.docs) {
            const workflowData = doc.data();
            const nodes = workflowData.nodes || [];
            const edges = workflowData.edges || [];
            const triggerNode = nodes.find(n => n.type === 'triggerNode');
            if (!triggerNode)
                continue;
            const triggerType = (_a = triggerNode.data) === null || _a === void 0 ? void 0 : _a.triggerType;
            if (triggerType === 'schedule') {
                const freq = triggerNode.data.scheduleFreq || 'daily';
                const time = triggerNode.data.scheduleTime || '09:00';
                let shouldRun = false;
                if (freq === 'minute')
                    shouldRun = true;
                else if (freq === 'hourly' && currentMinute === 0)
                    shouldRun = true;
                else if (freq === 'daily') {
                    const [h, m] = time.split(':').map(Number);
                    if (currentHour === h && currentMinute === m)
                        shouldRun = true;
                }
                // weekly, monthly could be implemented similarly
                if (shouldRun) {
                    await runWorkflow(doc.id, workflowData, enqueueNode);
                }
            }
            else if (triggerType === 'rss') {
                // Polling an RSS feed
                // Only run RSS checks every 20 minutes to save bandwidth, as requested.
                if (currentMinute % 20 !== 0)
                    continue;
                const feedUrl = triggerNode.data.rssUrl;
                if (!feedUrl)
                    continue;
                try {
                    const response = await axios_1.default.get(feedUrl, { timeout: 10000 });
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
                        await (0, db_1.getDb)().collection('workflows').doc(doc.id).update({ nodes });
                        // Run workflow with payload
                        await runWorkflow(doc.id, workflowData, enqueueNode, {
                            rss: { title, link, pubDate, guid: currentGuid }
                        });
                    }
                }
                catch (e) {
                    console.error(`[RSS] Failed to fetch feed for workflow ${doc.id}: ${e.message}`);
                }
            }
        }
    }
    catch (error) {
        console.error('[SCHEDULER] Failed:', error);
    }
});
async function runWorkflow(workflowId, workflowData, enqueueNodeFn, payload = {}) {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const nodes = workflowData.nodes;
    const edges = workflowData.edges;
    const triggerNode = nodes.find((n) => n.type === 'triggerNode');
    if (!triggerNode)
        return;
    console.log(`[SCHEDULER] Starting workflow ${workflowId} (${workflowData.name})`);
    await (0, db_1.getDb)().collection('executionLogs').doc(executionId).set({
        workflowId,
        workflowName: workflowData.name || 'Scheduled Workflow',
        status: 'running',
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        nodeCount: nodes.length,
        triggerPayload: payload
    });
    await enqueueNodeFn(workflowId, triggerNode.id, nodes, edges, payload, executionId);
}
//# sourceMappingURL=scheduler.js.map