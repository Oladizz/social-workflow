import { createPiece, createAction } from '../../framework';
import { getDb } from '../../db';
import axios from 'axios';
import * as cheerio from 'cheerio';
const pdfParse = require('pdf-parse');
import { GoogleGenAI } from '@google/genai';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ─── Knowledge Base (RAG) Piece ──────────────────────────────────────────────
export const knowledgePiece = createPiece({
  name: 'knowledge',
  displayName: 'Knowledge Base',
  logoUrl: '',
  actions: {
    scrape_url: createAction({
      name: 'scrape_url',
      displayName: 'Scrape URL',
      description: 'Extracts the main text content from a web page',
      run: async (context) => {
        const url = context.propsValue.url || context.payload.url;
        if (!url) return { scrapedText: '[MOCK Scraper: No URL provided]' };

        try {
          const response = await axios.get(url, { timeout: 15000 });
          const $ = cheerio.load(response.data);
          
          // Remove scripts, styles, navs, footers to get clean text
          $('script, style, noscript, iframe, nav, footer, header, aside').remove();
          
          const title = $('title').text().trim();
          const bodyText = $('body').text()
            .replace(/\s+/g, ' ')
            .trim();
            
          return { scrapedText: bodyText, title, url };
        } catch (error: any) {
          return { scrapedText: '', error: error.message, url };
        }
      }
    }),

    parse_pdf: createAction({
      name: 'parse_pdf',
      displayName: 'Parse PDF',
      description: 'Extracts text from a PDF URL',
      run: async (context) => {
        const url = context.propsValue.pdfUrl || context.payload.pdfUrl;
        if (!url) return { pdfText: '[MOCK PDF: No URL provided]' };

        try {
          const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
          const data = await pdfParse(Buffer.from(response.data));
          
          return { 
            pdfText: data.text.replace(/\s+/g, ' ').trim(), 
            numPages: data.numpages,
            info: data.info 
          };
        } catch (error: any) {
          return { pdfText: '', error: error.message };
        }
      }
    }),

    upsert_to_vector_db: createAction({
      name: 'upsert_to_vector_db',
      displayName: 'Save to Vector DB',
      description: 'Generates an embedding for text and saves it to Firestore',
      run: async (context) => {
        const text = context.propsValue.text || context.payload.generatedText || context.payload.scrapedText || '';
        const collectionName = context.propsValue.collectionName || 'knowledge_base';
        const metadata = context.propsValue.metadata || {}; // JSON string or object
        const apiKey = context.propsValue.apiKey; // Gemini API key for embeddings

        if (!text || !apiKey) {
          return { success: false, error: 'Text or Gemini API Key missing' };
        }

        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: text,
          });

          const embedding = response.embeddings?.[0]?.values;
          if (!embedding) throw new Error('Failed to generate embedding');

          const db = getDb();
          
          // Parse metadata if it's a string
          let parsedMetadata = metadata;
          if (typeof metadata === 'string') {
            try { parsedMetadata = JSON.parse(metadata); } catch (e) {}
          }

          const docRef = await db.collection(collectionName).add({
            text,
            metadata: parsedMetadata,
            // Try to use native vector type if available in the admin SDK version, otherwise array
            embedding: typeof FieldValue.vector === 'function' ? FieldValue.vector(embedding) : embedding,
            createdAt: FieldValue.serverTimestamp()
          });

          return { success: true, docId: docRef.id, embeddingLength: embedding.length };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }
    }),

    search_vector_db: createAction({
      name: 'search_vector_db',
      displayName: 'Search Vector DB',
      description: 'Finds the most relevant context for a query',
      run: async (context) => {
        const query = context.propsValue.query || context.payload.query || '';
        const collectionName = context.propsValue.collectionName || 'knowledge_base';
        const limit = Number(context.propsValue.limit) || 3;
        const apiKey = context.propsValue.apiKey;

        if (!query || !apiKey) {
          return { results: [], error: 'Query or Gemini API Key missing' };
        }

        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: query,
          });

          const queryVector = response.embeddings?.[0]?.values;
          if (!queryVector) throw new Error('Failed to generate embedding');

          const db = getDb();
          const collRef = db.collection(collectionName);
          
          let results: any[] = [];
          
          // Firestore native vector search (requires Admin SDK 12.0.0+ and proper indexes)
          if (typeof collRef.findNearest === 'function') {
             const vectorQuery = collRef.findNearest('embedding', FieldValue.vector(queryVector), {
               limit,
               distanceMeasure: 'COSINE'
             });
             const snapshot = await vectorQuery.get();
             results = snapshot.docs.map(doc => {
               const data = doc.data();
               return { id: doc.id, text: data.text, metadata: data.metadata };
             });
          } else {
             // Fallback: fetch recent and do poor-man's in-memory cosine similarity (just for demo parity if DB doesn't support it)
             // In production, you'd use a real vector DB or ensure Firestore indexes are created.
             const snapshot = await collRef.orderBy('createdAt', 'desc').limit(100).get();
             
             // Simple cosine similarity function
             const cosineSimilarity = (vecA: number[], vecB: number[]) => {
               let dotProduct = 0; let normA = 0; let normB = 0;
               for (let i = 0; i < vecA.length; i++) {
                 dotProduct += vecA[i] * vecB[i];
                 normA += vecA[i] * vecA[i];
                 normB += vecB[i] * vecB[i];
               }
               if (normA === 0 || normB === 0) return 0;
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
        } catch (error: any) {
          return { results: [], contextString: '', error: error.message };
        }
      }
    }),
  }
});
