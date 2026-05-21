"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiUtilsPiece = void 0;
const framework_1 = require("../../framework");
const genai_1 = require("@google/genai");
// Helper: run a structured AI prompt using Gemini (free tier friendly)
async function runStructuredPrompt(apiKey, systemInstruction, userPrompt) {
    if (!apiKey)
        return '[No API key provided]';
    const ai = new genai_1.GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstruction}\n\n---\n\nInput:\n${userPrompt}`,
    });
    return response.text || '';
}
// ─── AI Utilities Piece ──────────────────────────────────────────────────────
exports.aiUtilsPiece = (0, framework_1.createPiece)({
    name: 'ai_utils',
    displayName: 'AI Utilities',
    logoUrl: '',
    actions: {
        sentiment_analysis: (0, framework_1.createAction)({
            name: 'sentiment_analysis',
            displayName: 'Sentiment Analysis',
            description: 'Analyze the sentiment of text (positive, negative, neutral)',
            run: async (context) => {
                const text = context.propsValue.text || context.payload.generatedText || '';
                const apiKey = context.propsValue.apiKey;
                const result = await runStructuredPrompt(apiKey, `You are a sentiment analysis engine. Analyze the following text and respond with ONLY a JSON object containing:
- "sentiment": one of "positive", "negative", "neutral", "mixed"
- "score": a number from -1.0 (very negative) to 1.0 (very positive)
- "emotions": an array of detected emotions like ["joy", "trust", "surprise"]
- "summary": a one-sentence summary of the sentiment
Do not include any other text, only valid JSON.`, text);
                try {
                    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    return JSON.parse(cleaned);
                }
                catch (_a) {
                    return { sentiment: 'unknown', score: 0, raw: result };
                }
            }
        }),
        classify_text: (0, framework_1.createAction)({
            name: 'classify_text',
            displayName: 'Classify Text',
            description: 'Classify text into custom categories',
            run: async (context) => {
                const text = context.propsValue.text || context.payload.generatedText || '';
                const categories = context.propsValue.categories || 'business, technology, entertainment, sports, politics, science, health';
                const apiKey = context.propsValue.apiKey;
                const result = await runStructuredPrompt(apiKey, `You are a text classification engine. Classify the following text into one or more of these categories: ${categories}.
Respond with ONLY a JSON object containing:
- "primaryCategory": the most likely category
- "categories": an array of matching categories with confidence scores like [{"category": "tech", "confidence": 0.9}]
- "reasoning": brief explanation
Do not include any other text, only valid JSON.`, text);
                try {
                    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    return JSON.parse(cleaned);
                }
                catch (_a) {
                    return { primaryCategory: 'unknown', raw: result };
                }
            }
        }),
        extract_entities: (0, framework_1.createAction)({
            name: 'extract_entities',
            displayName: 'Extract Entities',
            description: 'Extract named entities (people, places, dates, etc.) from text',
            run: async (context) => {
                const text = context.propsValue.text || context.payload.generatedText || '';
                const apiKey = context.propsValue.apiKey;
                const result = await runStructuredPrompt(apiKey, `You are a named entity extraction engine. Extract all named entities from the following text.
Respond with ONLY a JSON object containing:
- "people": array of person names
- "organizations": array of organization names
- "locations": array of location names
- "dates": array of dates/times mentioned
- "products": array of product names
- "amounts": array of monetary amounts or quantities
- "urls": array of URLs
- "emails": array of emails
Do not include any other text, only valid JSON.`, text);
                try {
                    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    return JSON.parse(cleaned);
                }
                catch (_a) {
                    return { raw: result };
                }
            }
        }),
        summarize_text: (0, framework_1.createAction)({
            name: 'summarize_text',
            displayName: 'Summarize Text',
            description: 'Generate a concise summary of text',
            run: async (context) => {
                const text = context.propsValue.text || context.payload.generatedText || '';
                const length = context.propsValue.length || 'medium'; // short, medium, long
                const apiKey = context.propsValue.apiKey;
                const lengthGuide = {
                    short: '1-2 sentences',
                    medium: '3-5 sentences',
                    long: '1-2 paragraphs',
                }[length] || '3-5 sentences';
                const result = await runStructuredPrompt(apiKey, `You are a text summarization engine. Create a ${lengthGuide} summary of the following text.
Respond with ONLY a JSON object containing:
- "summary": the summarized text
- "keyPoints": array of 3-5 key bullet points
- "wordCount": number of words in the original text
Do not include any other text, only valid JSON.`, text);
                try {
                    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    return JSON.parse(cleaned);
                }
                catch (_a) {
                    return { summary: result };
                }
            }
        }),
        translate_text: (0, framework_1.createAction)({
            name: 'translate_text',
            displayName: 'Translate Text',
            description: 'Translate text between languages',
            run: async (context) => {
                const text = context.propsValue.text || context.payload.generatedText || '';
                const targetLanguage = context.propsValue.targetLanguage || 'Spanish';
                const apiKey = context.propsValue.apiKey;
                const result = await runStructuredPrompt(apiKey, `You are a translation engine. Translate the following text to ${targetLanguage}. 
Respond with ONLY a JSON object containing:
- "translation": the translated text
- "sourceLanguage": detected source language
- "targetLanguage": "${targetLanguage}"
Do not include any other text, only valid JSON.`, text);
                try {
                    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    const parsed = JSON.parse(cleaned);
                    return Object.assign(Object.assign({}, parsed), { generatedText: parsed.translation });
                }
                catch (_a) {
                    return { translation: result, generatedText: result };
                }
            }
        }),
    }
});
//# sourceMappingURL=index.js.map