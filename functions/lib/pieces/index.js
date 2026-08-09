"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPiece = exports.pieces = void 0;
const twitter_1 = require("./twitter");
const openai_1 = require("./openai");
const claude_1 = require("./claude");
const ai_utils_1 = require("./ai-utils");
const framework_1 = require("../framework");
const axios_1 = __importDefault(require("axios"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const genai_1 = require("@google/genai");
// --- LinkedIn Piece ---
const linkedinPiece = (0, framework_1.createPiece)({
    name: 'linkedin',
    displayName: 'LinkedIn',
    logoUrl: '',
    actions: {
        create_post: (0, framework_1.createAction)({
            name: 'create_post',
            displayName: 'Create Post',
            description: 'Create a LinkedIn post',
            run: async (context) => {
                const message = context.propsValue.message || context.payload.generatedText;
                const token = context.propsValue.apiKey;
                const authorUrn = context.propsValue.authorUrn || 'urn:li:person:MOCK_ID';
                if (!token)
                    throw new Error('LinkedIn credentials missing in node properties.');
                const payload = {
                    author: authorUrn,
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': { shareCommentary: { text: message }, shareMediaCategory: 'NONE' }
                    },
                    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
                };
                const response = await axios_1.default.post('https://api.linkedin.com/v2/ugcPosts', payload, {
                    headers: { 'Authorization': `Bearer ${token}`, 'X-Restli-Protocol-Version': '2.0.0', 'Content-Type': 'application/json' }
                });
                return response.data;
            }
        })
    }
});
// --- Buffer Piece ---
const bufferPiece = (0, framework_1.createPiece)({
    name: 'buffer',
    displayName: 'Buffer',
    logoUrl: '',
    actions: {
        create_post: (0, framework_1.createAction)({
            name: 'create_post',
            displayName: 'Create Post',
            description: 'Create a post across multiple social media platforms via Buffer',
            run: async (context) => {
                var _a, _b, _c, _d, _e;
                const message = context.propsValue.message || context.propsValue.content || context.payload.generatedText || 'Hello from Social Workflow!';
                const bufferToken = process.env.BUFFER_API_KEY || 'N5YGSt1hQeD8ektOYIKzWMmZgl7XBy7N3-lqjoAfJd2';
                // 1. Get organization ID
                const orgRes = await axios_1.default.post('https://api.buffer.com', { query: '{ account { organizations { id } } }' }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bufferToken}` } });
                const orgId = (_d = (_c = (_b = (_a = orgRes.data.data) === null || _a === void 0 ? void 0 : _a.account) === null || _b === void 0 ? void 0 : _b.organizations) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id;
                if (!orgId)
                    throw new Error('Could not find Buffer organization');
                // 2. Get channels
                const channelsRes = await axios_1.default.post('https://api.buffer.com', { query: `{ channels(input: {organizationId: "${orgId}"}) { id name service } }` }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bufferToken}` } });
                const channels = ((_e = channelsRes.data.data) === null || _e === void 0 ? void 0 : _e.channels) || [];
                // Match the original requested platform stored in propsValue, or fallback
                const originalPlatform = (context.propsValue.originalPlatform || 'all').toLowerCase();
                let targetChannels = channels;
                if (originalPlatform !== 'all' && originalPlatform !== 'buffer') {
                    const searchService = originalPlatform === 'x' ? 'twitter' : originalPlatform;
                    targetChannels = channels.filter((c) => c.service.toLowerCase() === searchService);
                }
                if (targetChannels.length === 0) {
                    targetChannels = channels; // fallback to all
                }
                if (targetChannels.length === 0) {
                    throw new Error(`No connected Buffer channels found.`);
                }
                // 3. Post to channels
                const results = [];
                for (const channel of targetChannels) {
                    const postRes = await axios_1.default.post('https://api.buffer.com', {
                        query: `mutation CreatePost($input: CreatePostInput!) {
                createPost(input: $input) {
                  __typename
                }
              }`,
                        variables: {
                            input: {
                                channelId: channel.id,
                                text: message,
                                mode: "shareNow",
                                needsApproval: false,
                                schedulingType: "automatic",
                                assets: []
                            }
                        }
                    }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bufferToken}` } });
                    if (postRes.data.errors) {
                        throw new Error(`Buffer API Error for ${channel.service}: ${postRes.data.errors[0].message}`);
                    }
                    results.push({ channel: channel.service, result: postRes.data.data });
                }
                return { message: `Posted via Buffer to ${targetChannels.length} channels`, results };
            }
        })
    }
});
// --- Gmail Piece ---
const gmailPiece = (0, framework_1.createPiece)({
    name: 'gmail',
    displayName: 'Gmail',
    logoUrl: '',
    actions: {
        send_email: (0, framework_1.createAction)({
            name: 'send_email',
            displayName: 'Send Email',
            description: 'Draft or send an email via Gmail',
            run: async (context) => {
                const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
                const endpoint = '/api/gmail/draft';
                const to = context.propsValue.to || 'test@example.com';
                const subject = context.propsValue.subject || 'Automated Email';
                const body = context.propsValue.body || context.propsValue.content || context.propsValue.message || context.payload.generatedText || 'Hello from Social Workflow!';
                const response = await axios_1.default.post(`${backendUrl}${endpoint}`, {
                    to,
                    subject,
                    body
                });
                return response.data;
            }
        })
    }
});
// --- Google Business Piece ---
const googlebusinessPiece = (0, framework_1.createPiece)({
    name: 'googlebusiness',
    displayName: 'Google Business',
    logoUrl: '',
    actions: {
        post: (0, framework_1.createAction)({
            name: 'post',
            displayName: 'Create Post',
            description: 'Create a post on Google Business Profile',
            run: async (context) => {
                const message = context.propsValue.message || context.payload.generatedText || 'Hello from Social Workflow!';
                const token = context.propsValue.apiKey;
                if (!token)
                    throw new Error('Google Business API credentials missing.');
                // This is a placeholder for the real independent Google Business Profile API
                // https://developers.google.com/my-business/content/basic-setup
                console.log('[EXEC] Simulated Google Business API call with message:', message);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, message: `Simulated posting to Google Business: ${message}` };
            }
        })
    }
});
// --- Telegram Piece ---
const telegramPiece = (0, framework_1.createPiece)({
    name: 'telegram',
    displayName: 'Telegram',
    logoUrl: '',
    actions: {
        send_message: (0, framework_1.createAction)({
            name: 'send_message',
            displayName: 'Send Message',
            description: 'Send a message to a Telegram chat',
            run: async (context) => {
                const message = context.propsValue.message || context.payload.generatedText;
                const token = context.propsValue.apiKey;
                const chatId = context.propsValue.chatId || 'MOCK_CHAT_ID';
                if (!token)
                    throw new Error('Telegram credentials missing in node properties.');
                const bot = new node_telegram_bot_api_1.default(token, { polling: false });
                return await bot.sendMessage(chatId, message);
            }
        })
    }
});
// --- Gemini AI Piece ---
const geminiPiece = (0, framework_1.createPiece)({
    name: 'gemini',
    displayName: 'Google Gemini',
    logoUrl: '',
    actions: {
        generate_content: (0, framework_1.createAction)({
            name: 'generate_content',
            displayName: 'Generate Content',
            description: 'Generate text using Gemini 2.5 Flash or Pro',
            run: async (context) => {
                const prompt = context.propsValue.prompt;
                const systemPrompt = context.propsValue.systemPrompt || '';
                const token = context.propsValue.apiKey;
                const model = context.propsValue.model || 'gemini-2.5-flash';
                if (!token) {
                    return { generatedText: `[MOCK Gemini: Please provide API Key. Prompt: ${prompt === null || prompt === void 0 ? void 0 : prompt.slice(0, 100)}]` };
                }
                const ai = new genai_1.GoogleGenAI({ apiKey: token });
                const fullPrompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${prompt}` : prompt;
                const response = await ai.models.generateContent({ model, contents: fullPrompt });
                return { generatedText: response.text, model };
            }
        }),
        chat_conversation: (0, framework_1.createAction)({
            name: 'chat_conversation',
            displayName: 'Multi-Turn Chat',
            description: 'Continue a conversation with Gemini',
            run: async (context) => {
                const token = context.propsValue.apiKey;
                const model = context.propsValue.model || 'gemini-2.5-flash';
                const newMessage = context.propsValue.prompt || '';
                const systemPrompt = context.propsValue.systemPrompt || '';
                const history = context.payload._chatHistory || [];
                if (!token) {
                    return { generatedText: `[MOCK Gemini Chat]`, _chatHistory: history };
                }
                const ai = new genai_1.GoogleGenAI({ apiKey: token });
                // Build conversation context
                const conversationText = history.map((m) => `${m.role}: ${m.content}`).join('\n');
                const fullPrompt = systemPrompt
                    ? `${systemPrompt}\n\nConversation so far:\n${conversationText}\n\nuser: ${newMessage}`
                    : `${conversationText}\nuser: ${newMessage}`;
                const response = await ai.models.generateContent({ model, contents: fullPrompt });
                const reply = response.text || '';
                return {
                    generatedText: reply,
                    _chatHistory: [...history, { role: 'user', content: newMessage }, { role: 'assistant', content: reply }],
                };
            }
        }),
        vision_analyze: (0, framework_1.createAction)({
            name: 'vision_analyze',
            displayName: 'Analyze Image (Vision)',
            description: 'Analyze an image using Gemini vision',
            run: async (context) => {
                const token = context.propsValue.apiKey;
                const model = context.propsValue.model || 'gemini-2.5-flash';
                const prompt = context.propsValue.prompt || 'Describe this image.';
                const imageUrl = context.propsValue.imageUrl || '';
                if (!token || !imageUrl) {
                    return { generatedText: `[MOCK Gemini Vision: No API key or image URL]` };
                }
                // Download image and convert to base64
                const imgResponse = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
                const base64 = Buffer.from(imgResponse.data).toString('base64');
                const mimeType = String(imgResponse.headers['content-type'] || 'image/jpeg');
                const ai = new genai_1.GoogleGenAI({ apiKey: token });
                const response = await ai.models.generateContent({
                    model,
                    contents: [
                        { text: prompt },
                        { inlineData: { mimeType, data: base64 } },
                    ],
                });
                return { generatedText: response.text || '', model };
            }
        }),
    }
});
const knowledge_1 = require("./knowledge");
// ─── All Pieces Registry ────────────────────────────────────────────────────
exports.pieces = [
    bufferPiece,
    gmailPiece,
    googlebusinessPiece,
    twitter_1.twitterPiece,
    linkedinPiece,
    telegramPiece,
    geminiPiece,
    openai_1.openaiPiece,
    claude_1.claudePiece,
    ai_utils_1.aiUtilsPiece,
    knowledge_1.knowledgePiece,
];
const getPiece = (name) => exports.pieces.find(p => p.name === name);
exports.getPiece = getPiece;
//# sourceMappingURL=index.js.map