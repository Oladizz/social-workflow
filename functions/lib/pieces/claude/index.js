"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claudePiece = void 0;
const framework_1 = require("../../framework");
const axios_1 = __importDefault(require("axios"));
// ─── Anthropic Claude Piece ──────────────────────────────────────────────────
exports.claudePiece = (0, framework_1.createPiece)({
    name: 'claude',
    displayName: 'Anthropic Claude',
    logoUrl: '',
    actions: {
        generate_text: (0, framework_1.createAction)({
            name: 'generate_text',
            displayName: 'Generate Text',
            description: 'Generate text using Claude 4 Opus, Claude 4 Sonnet, or Claude 3.5 Haiku',
            run: async (context) => {
                var _a, _b;
                const apiKey = context.propsValue.apiKey;
                const model = context.propsValue.model || 'claude-sonnet-4-20250514';
                const prompt = context.propsValue.prompt || '';
                const systemPrompt = context.propsValue.systemPrompt || '';
                const temperature = Number(context.propsValue.temperature) || 0.7;
                const maxTokens = Number(context.propsValue.maxTokens) || 1024;
                if (!apiKey) {
                    return { generatedText: `[MOCK Claude: No API key. Prompt: ${prompt.slice(0, 100)}]` };
                }
                const messages = [{ role: 'user', content: prompt }];
                const body = { model, messages, max_tokens: maxTokens, temperature };
                if (systemPrompt)
                    body.system = systemPrompt;
                const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', body, {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000,
                });
                const text = ((_b = (_a = response.data.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) || '';
                return {
                    generatedText: text,
                    model,
                    usage: response.data.usage,
                    stopReason: response.data.stop_reason,
                };
            }
        }),
        chat_conversation: (0, framework_1.createAction)({
            name: 'chat_conversation',
            displayName: 'Multi-Turn Chat',
            description: 'Continue a multi-turn conversation with Claude',
            run: async (context) => {
                var _a, _b;
                const apiKey = context.propsValue.apiKey;
                const model = context.propsValue.model || 'claude-sonnet-4-20250514';
                const newMessage = context.propsValue.prompt || '';
                const systemPrompt = context.propsValue.systemPrompt || '';
                const temperature = Number(context.propsValue.temperature) || 0.7;
                const history = context.payload._chatHistory || [];
                if (!apiKey) {
                    return { generatedText: `[MOCK Claude Chat: ${newMessage.slice(0, 100)}]`, _chatHistory: history };
                }
                const messages = [...history, { role: 'user', content: newMessage }];
                const body = { model, messages, max_tokens: 1024, temperature };
                if (systemPrompt)
                    body.system = systemPrompt;
                const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', body, {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000,
                });
                const reply = ((_b = (_a = response.data.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) || '';
                const updatedHistory = [
                    ...history,
                    { role: 'user', content: newMessage },
                    { role: 'assistant', content: reply },
                ];
                return {
                    generatedText: reply,
                    _chatHistory: updatedHistory,
                    turnCount: updatedHistory.length / 2,
                };
            }
        }),
        vision_analyze: (0, framework_1.createAction)({
            name: 'vision_analyze',
            displayName: 'Analyze Image (Vision)',
            description: 'Analyze an image using Claude vision capabilities',
            run: async (context) => {
                var _a, _b;
                const apiKey = context.propsValue.apiKey;
                const model = context.propsValue.model || 'claude-sonnet-4-20250514';
                const prompt = context.propsValue.prompt || 'Describe this image.';
                const imageUrl = context.propsValue.imageUrl || '';
                if (!apiKey || !imageUrl) {
                    return { generatedText: `[MOCK Claude Vision: No API key or image URL]` };
                }
                // Download the image and convert to base64
                const imgResponse = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
                const base64 = Buffer.from(imgResponse.data).toString('base64');
                const contentType = imgResponse.headers['content-type'] || 'image/jpeg';
                const messages = [{
                        role: 'user',
                        content: [
                            { type: 'image', source: { type: 'base64', media_type: contentType, data: base64 } },
                            { type: 'text', text: prompt },
                        ]
                    }];
                const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
                    model, messages, max_tokens: 1024,
                }, {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000,
                });
                return { generatedText: ((_b = (_a = response.data.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) || '', model };
            }
        }),
    }
});
//# sourceMappingURL=index.js.map