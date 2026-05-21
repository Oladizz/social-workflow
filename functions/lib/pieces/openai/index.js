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
exports.openaiPiece = void 0;
const framework_1 = require("../../framework");
const axios_1 = __importDefault(require("axios"));
// ─── OpenAI Piece ─────────────────────────────────────────────────────────────
exports.openaiPiece = (0, framework_1.createPiece)({
    name: 'openai',
    displayName: 'OpenAI',
    logoUrl: '',
    actions: {
        generate_text: (0, framework_1.createAction)({
            name: 'generate_text',
            displayName: 'Generate Text (Chat)',
            description: 'Generate text using GPT-4o, GPT-4o-mini, or o3-mini',
            run: async (context) => {
                var _a, _b, _c, _d, _e;
                const apiKey = context.propsValue.apiKey;
                const model = context.propsValue.model || 'gpt-4o-mini';
                const prompt = context.propsValue.prompt || '';
                const systemPrompt = context.propsValue.systemPrompt || '';
                const temperature = Number(context.propsValue.temperature) || 0.7;
                const maxTokens = Number(context.propsValue.maxTokens) || 1024;
                if (!apiKey) {
                    return { generatedText: `[MOCK OpenAI: No API key. Prompt: ${prompt.slice(0, 100)}]` };
                }
                const messages = [];
                if (systemPrompt)
                    messages.push({ role: 'system', content: systemPrompt });
                messages.push({ role: 'user', content: prompt });
                const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                    model, messages, temperature, max_tokens: maxTokens,
                }, {
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    timeout: 60000,
                });
                const text = ((_c = (_b = (_a = response.data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
                return {
                    generatedText: text,
                    model,
                    usage: response.data.usage,
                    finishReason: (_e = (_d = response.data.choices) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.finish_reason,
                };
            }
        }),
        chat_conversation: (0, framework_1.createAction)({
            name: 'chat_conversation',
            displayName: 'Multi-Turn Chat',
            description: 'Continue a multi-turn conversation with memory',
            run: async (context) => {
                var _a, _b, _c;
                const apiKey = context.propsValue.apiKey;
                const model = context.propsValue.model || 'gpt-4o-mini';
                const newMessage = context.propsValue.prompt || context.propsValue.message || '';
                const systemPrompt = context.propsValue.systemPrompt || '';
                const temperature = Number(context.propsValue.temperature) || 0.7;
                // Retrieve conversation history from payload
                const history = context.payload._chatHistory || [];
                if (!apiKey) {
                    return { generatedText: `[MOCK Chat: ${newMessage.slice(0, 100)}]`, _chatHistory: history };
                }
                const messages = [];
                if (systemPrompt)
                    messages.push({ role: 'system', content: systemPrompt });
                messages.push(...history);
                messages.push({ role: 'user', content: newMessage });
                const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                    model, messages, temperature,
                }, {
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    timeout: 60000,
                });
                const reply = ((_c = (_b = (_a = response.data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
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
            description: 'Analyze an image using GPT-4o vision capabilities',
            run: async (context) => {
                var _a, _b, _c;
                const apiKey = context.propsValue.apiKey;
                const model = context.propsValue.model || 'gpt-4o';
                const prompt = context.propsValue.prompt || 'Describe this image in detail.';
                const imageUrl = context.propsValue.imageUrl || '';
                if (!apiKey || !imageUrl) {
                    return { generatedText: `[MOCK Vision: No API key or image URL provided]` };
                }
                const messages = [{
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: imageUrl } },
                        ]
                    }];
                const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                    model, messages, max_tokens: 1024,
                }, {
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    timeout: 60000,
                });
                return {
                    generatedText: ((_c = (_b = (_a = response.data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '',
                    model,
                };
            }
        }),
        transcribe_audio: (0, framework_1.createAction)({
            name: 'transcribe_audio',
            displayName: 'Transcribe Audio (Whisper)',
            description: 'Transcribe audio files using OpenAI Whisper',
            run: async (context) => {
                const apiKey = context.propsValue.apiKey;
                const audioUrl = context.propsValue.audioUrl || '';
                const language = context.propsValue.language || 'en';
                if (!apiKey || !audioUrl) {
                    return { transcription: `[MOCK Whisper: No API key or audio URL]` };
                }
                // Download audio file
                const audioResponse = await axios_1.default.get(audioUrl, { responseType: 'arraybuffer', timeout: 30000 });
                const FormData = (await Promise.resolve().then(() => __importStar(require('form-data')))).default;
                const form = new FormData();
                form.append('file', Buffer.from(audioResponse.data), { filename: 'audio.mp3', contentType: 'audio/mpeg' });
                form.append('model', 'whisper-1');
                form.append('language', language);
                const response = await axios_1.default.post('https://api.openai.com/v1/audio/transcriptions', form, {
                    headers: Object.assign({ 'Authorization': `Bearer ${apiKey}` }, form.getHeaders()),
                    timeout: 120000,
                });
                return { transcription: response.data.text, language };
            }
        }),
        text_to_speech: (0, framework_1.createAction)({
            name: 'text_to_speech',
            displayName: 'Text to Speech',
            description: 'Convert text to speech using OpenAI TTS',
            run: async (context) => {
                const apiKey = context.propsValue.apiKey;
                const text = context.propsValue.text || context.propsValue.prompt || context.payload.generatedText || '';
                const voice = context.propsValue.voice || 'alloy';
                const model = context.propsValue.ttsModel || 'tts-1';
                if (!apiKey || !text) {
                    return { audioUrl: '[MOCK TTS: No API key or text]' };
                }
                const response = await axios_1.default.post('https://api.openai.com/v1/audio/speech', {
                    model, input: text, voice,
                }, {
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    responseType: 'arraybuffer',
                    timeout: 60000,
                });
                // Return base64 encoded audio
                const audioBase64 = Buffer.from(response.data).toString('base64');
                return { audioBase64, voice, model, textLength: text.length };
            }
        }),
    }
});
//# sourceMappingURL=index.js.map