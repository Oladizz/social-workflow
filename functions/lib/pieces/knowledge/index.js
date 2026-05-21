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
exports.knowledgePiece = void 0;
const framework_1 = require("../../framework");
const db_1 = require("../../db");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const pdfParse = require('pdf-parse');
const genai_1 = require("@google/genai");
const firestore_1 = require("firebase-admin/firestore");
// ─── Knowledge Base (RAG) Piece ──────────────────────────────────────────────
exports.knowledgePiece = (0, framework_1.createPiece)({
    name: 'knowledge',
    displayName: 'Knowledge Base',
    logoUrl: '',
    actions: {
        scrape_url: (0, framework_1.createAction)({
            name: 'scrape_url',
            displayName: 'Scrape URL',
            description: 'Extracts the main text content from a web page',
            run: async (context) => {
                const url = context.propsValue.url || context.payload.url;
                if (!url)
                    return { scrapedText: '[MOCK Scraper: No URL provided]' };
                try {
                    const response = await axios_1.default.get(url, { timeout: 15000 });
                    const $ = cheerio.load(response.data);
                    // Remove scripts, styles, navs, footers to get clean text
                    $('script, style, noscript, iframe, nav, footer, header, aside').remove();
                    const title = $('title').text().trim();
                    const bodyText = $('body').text()
                        .replace(/\s+/g, ' ')
                        .trim();
                    return { scrapedText: bodyText, title, url };
                }
                catch (error) {
                    return { scrapedText: '', error: error.message, url };
                }
            }
        }),
        parse_pdf: (0, framework_1.createAction)({
            name: 'parse_pdf',
            displayName: 'Parse PDF',
            description: 'Extracts text from a PDF URL',
            run: async (context) => {
                const url = context.propsValue.pdfUrl || context.payload.pdfUrl;
                if (!url)
                    return { pdfText: '[MOCK PDF: No URL provided]' };
                try {
                    const response = await axios_1.default.get(url, { responseType: 'arraybuffer', timeout: 30000 });
                    const data = await pdfParse(Buffer.from(response.data));
                    return {
                        pdfText: data.text.replace(/\s+/g, ' ').trim(),
                        numPages: data.numpages,
                        info: data.info
                    };
                }
                catch (error) {
                    return { pdfText: '', error: error.message };
                }
            }
        }),
        upsert_to_vector_db: (0, framework_1.createAction)({
            name: 'upsert_to_vector_db',
            displayName: 'Save to Vector DB',
            description: 'Generates an embedding for text and saves it to Firestore',
            run: async (context) => {
                var _a, _b;
                const text = context.propsValue.text || context.payload.generatedText || context.payload.scrapedText || '';
                const collectionName = context.propsValue.collectionName || 'knowledge_base';
                const metadata = context.propsValue.metadata || {}; // JSON string or object
                const apiKey = context.propsValue.apiKey; // Gemini API key for embeddings
                if (!text || !apiKey) {
                    return { success: false, error: 'Text or Gemini API Key missing' };
                }
                try {
                    const ai = new genai_1.GoogleGenAI({ apiKey });
                    const response = await ai.models.embedContent({
                        model: 'text-embedding-004',
                        contents: text,
                    });
                    const embedding = (_b = (_a = response.embeddings) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.values;
                    if (!embedding)
                        throw new Error('Failed to generate embedding');
                    const db = (0, db_1.getDb)();
                    // Parse metadata if it's a string
                    let parsedMetadata = metadata;
                    if (typeof metadata === 'string') {
                        try {
                            parsedMetadata = JSON.parse(metadata);
                        }
                        catch (e) { }
                    }
                    const docRef = await db.collection(collectionName).add({
                        text,
                        metadata: parsedMetadata,
                        // Try to use native vector type if available in the admin SDK version, otherwise array
                        embedding: typeof firestore_1.FieldValue.vector === 'function' ? firestore_1.FieldValue.vector(embedding) : embedding,
                        createdAt: firestore_1.FieldValue.serverTimestamp()
                    });
                    return { success: true, docId: docRef.id, embeddingLength: embedding.length };
                }
                catch (error) {
                    return { success: false, error: error.message };
                }
            }
        }),
        search_vector_db: (0, framework_1.createAction)({
            name: 'search_vector_db',
            displayName: 'Search Vector DB',
            description: 'Finds the most relevant context for a query',
            run: async (context) => {
                var _a, _b;
                const query = context.propsValue.query || context.payload.query || '';
                const collectionName = context.propsValue.collectionName || 'knowledge_base';
                const limit = Number(context.propsValue.limit) || 3;
                const apiKey = context.propsValue.apiKey;
                if (!query || !apiKey) {
                    return { results: [], error: 'Query or Gemini API Key missing' };
                }
                try {
                    const ai = new genai_1.GoogleGenAI({ apiKey });
                    const response = await ai.models.embedContent({
                        model: 'text-embedding-004',
                        contents: query,
                    });
                    const queryVector = (_b = (_a = response.embeddings) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.values;
                    if (!queryVector)
                        throw new Error('Failed to generate embedding');
                    const db = (0, db_1.getDb)();
                    const collRef = db.collection(collectionName);
                    let results = [];
                    // Firestore native vector search (requires Admin SDK 12.0.0+ and proper indexes)
                    if (typeof collRef.findNearest === 'function') {
                        const vectorQuery = collRef.findNearest('embedding', firestore_1.FieldValue.vector(queryVector), {
                            limit,
                            distanceMeasure: 'COSINE'
                        });
                        const snapshot = await vectorQuery.get();
                        results = snapshot.docs.map(doc => {
                            const data = doc.data();
                            return { id: doc.id, text: data.text, metadata: data.metadata };
                        });
                    }
                    else {
                        // Fallback: fetch recent and do poor-man's in-memory cosine similarity (just for demo parity if DB doesn't support it)
                        // In production, you'd use a real vector DB or ensure Firestore indexes are created.
                        const snapshot = await collRef.orderBy('createdAt', 'desc').limit(100).get();
                        // Simple cosine similarity function
                        const cosineSimilarity = (vecA, vecB) => {
                            let dotProduct = 0;
                            let normA = 0;
                            let normB = 0;
                            for (let i = 0; i < vecA.length; i++) {
                                dotProduct += vecA[i] * vecB[i];
                                normA += vecA[i] * vecA[i];
                                normB += vecB[i] * vecB[i];
                            }
                            if (normA === 0 || normB === 0)
                                return 0;
                            return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
                        };
                        const scoredDocs = snapshot.docs.map(doc => {
                            const data = doc.data();
                            const score = (data.embedding && Array.isArray(data.embedding))
                                ? cosineSimilarity(queryVector, data.embedding)
                                : -1;
                            return { id: doc.id, text: data.text, metadata: data.metadata, score };
                        });
                        scoredDocs.sort((a, b) => b.score - a.score);
                        results = scoredDocs.slice(0, limit).map(d => ({ id: d.id, text: d.text, metadata: d.metadata }));
                    }
                    // Join the text into a single context string for easy passing to AI
                    const contextString = results.map(r => r.text).join('\n\n---\n\n');
                    return { results, contextString };
                }
                catch (error) {
                    return { results: [], contextString: '', error: error.message };
                }
            }
        }),
    }
});
//# sourceMappingURL=index.js.map