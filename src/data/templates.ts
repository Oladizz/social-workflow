import { AppNode, AppEdge } from '../store/useWorkflowStore';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  nodes: AppNode[];
  edges: AppEdge[];
}

export const TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'daily-twitter-ai',
    name: 'Daily AI Tweet',
    description: 'Gemini writes a motivational tweet every morning and posts it to X/Twitter automatically.',
    icon: '🌅',
    tags: ['Twitter', 'AI', 'Daily'],
    nodes: [
      { id: 't1', type: 'triggerNode', position: { x: 300, y: 60 }, data: { triggerType: 'schedule', scheduleFreq: 'daily', scheduleTime: '09:00' } },
      { id: 'a1', type: 'aiNode',      position: { x: 300, y: 220 }, data: { prompt: 'Write a short motivational tweet (under 280 chars). No hashtags.', model: 'gemini-2.5-flash', tone: 'motivational' } },
      { id: 'a2', type: 'actionNode',  position: { x: 300, y: 380 }, data: { platform: 'twitter', selectedAction: 'tweet' } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'a1', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
      { id: 'e2', source: 'a1', target: 'a2', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
    ],
  },
  {
    id: 'news-to-linkedin',
    name: 'RSS → LinkedIn Post',
    description: 'Watch an RSS feed, summarise new articles with Gemini AI, and post to LinkedIn.',
    icon: '📰',
    tags: ['RSS', 'LinkedIn', 'AI'],
    nodes: [
      { id: 't1', type: 'triggerNode', position: { x: 300, y: 60 }, data: { triggerType: 'rss', rssFreq: '60', rssUrl: '' } },
      { id: 'a1', type: 'aiNode',      position: { x: 300, y: 220 }, data: { prompt: 'Summarise this article into a professional 3-sentence LinkedIn post.', tone: 'professional' } },
      { id: 'a2', type: 'actionNode',  position: { x: 300, y: 380 }, data: { platform: 'linkedin', selectedAction: 'post' } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'a1', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
      { id: 'e2', source: 'a1', target: 'a2', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
    ],
  },
  {
    id: 'cross-post-socials',
    name: 'Cross-Post to All Socials',
    description: 'One AI-generated post, blasted to Twitter, LinkedIn, and Telegram every week.',
    icon: '📢',
    tags: ['Twitter', 'LinkedIn', 'Telegram', 'AI'],
    nodes: [
      { id: 't1', type: 'triggerNode', position: { x: 400, y: 40  }, data: { triggerType: 'schedule', scheduleFreq: 'weekly', scheduleDay: '1', scheduleTime: '10:00' } },
      { id: 'a1', type: 'aiNode',      position: { x: 400, y: 200 }, data: { prompt: 'Write an engaging social media post about AI trends. Keep it under 280 chars.', tone: 'witty' } },
      { id: 'a2', type: 'actionNode',  position: { x: 160, y: 380 }, data: { platform: 'twitter',  selectedAction: 'tweet'   } },
      { id: 'a3', type: 'actionNode',  position: { x: 400, y: 380 }, data: { platform: 'linkedin', selectedAction: 'post'    } },
      { id: 'a4', type: 'actionNode',  position: { x: 640, y: 380 }, data: { platform: 'telegram', selectedAction: 'message' } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'a1', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
      { id: 'e2', source: 'a1', target: 'a2', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
      { id: 'e3', source: 'a1', target: 'a3', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
      { id: 'e4', source: 'a1', target: 'a4', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
    ],
  },
  {
    id: 'webhook-discord',
    name: 'Webhook → Discord Alert',
    description: 'Receive a webhook, let Gemini format the message, and post it to your Discord channel.',
    icon: '🔔',
    tags: ['Webhook', 'Discord', 'AI'],
    nodes: [
      { id: 't1', type: 'triggerNode', position: { x: 300, y: 60 }, data: { triggerType: 'webhook' } },
      { id: 'a1', type: 'aiNode',      position: { x: 300, y: 220 }, data: { prompt: 'Format the incoming webhook data into a clean Discord-friendly alert message.', tone: 'professional' } },
      { id: 'a2', type: 'actionNode',  position: { x: 300, y: 380 }, data: { platform: 'discord', selectedAction: 'message' } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'a1', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
      { id: 'e2', source: 'a1', target: 'a2', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
    ],
  },
  {
    id: 'reddit-engagement',
    name: 'Reddit Community Post',
    description: 'Schedule a weekly AI-generated post to your subreddit to keep the community engaged.',
    icon: '🤖',
    tags: ['Reddit', 'AI', 'Weekly'],
    nodes: [
      { id: 't1', type: 'triggerNode', position: { x: 300, y: 60 }, data: { triggerType: 'schedule', scheduleFreq: 'weekly', scheduleDay: '5', scheduleTime: '18:00' } },
      { id: 'a1', type: 'aiNode',      position: { x: 300, y: 220 }, data: { prompt: 'Write an engaging Reddit post for a tech community. Include a question to spark discussion.', tone: 'casual' } },
      { id: 'a2', type: 'actionNode',  position: { x: 300, y: 380 }, data: { platform: 'reddit', selectedAction: 'post' } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'a1', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
      { id: 'e2', source: 'a1', target: 'a2', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
    ],
  },
  {
    id: 'manual-instagram',
    name: 'Manual Instagram Push',
    description: 'Manually trigger an AI-generated caption and post it to Instagram.',
    icon: '📸',
    tags: ['Instagram', 'AI', 'Manual'],
    nodes: [
      { id: 't1', type: 'triggerNode', position: { x: 300, y: 60 }, data: { triggerType: 'manual' } },
      { id: 'a1', type: 'aiNode',      position: { x: 300, y: 220 }, data: { prompt: 'Write a vibrant, emoji-rich Instagram caption for a lifestyle photo. Include 5 relevant hashtags.', tone: 'casual' } },
      { id: 'a2', type: 'actionNode',  position: { x: 300, y: 380 }, data: { platform: 'instagram', selectedAction: 'post' } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'a1', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
      { id: 'e2', source: 'a1', target: 'a2', animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } },
    ],
  },
];
