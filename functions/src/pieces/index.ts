import { Piece } from '../framework';
import { twitterPiece } from './twitter';
import { openaiPiece } from './openai';
import { claudePiece } from './claude';
import { aiUtilsPiece } from './ai-utils';
import { createPiece, createAction } from '../framework';
import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import { GoogleGenAI } from '@google/genai';

// --- LinkedIn Piece ---
const linkedinPiece = createPiece({
  name: 'linkedin',
  displayName: 'LinkedIn',
  logoUrl: '',
  actions: {
    create_post: createAction({
      name: 'create_post',
      displayName: 'Create Post',
      description: 'Create a LinkedIn post',
      run: async (context) => {
        const message = context.propsValue.message || context.payload.generatedText;
        const token = context.propsValue.apiKey;
        const authorUrn = context.propsValue.authorUrn || 'urn:li:person:MOCK_ID';
        if (!token) throw new Error('LinkedIn credentials missing in node properties.');

        const payload = {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': { shareCommentary: { text: message }, shareMediaCategory: 'NONE' }
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
        };

        const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', payload, {
          headers: { 'Authorization': `Bearer ${token}`, 'X-Restli-Protocol-Version': '2.0.0', 'Content-Type': 'application/json' }
        });
        return response.data;
      }
    })
  }
});

// --- Telegram Piece ---
const telegramPiece = createPiece({
  name: 'telegram',
  displayName: 'Telegram',
  logoUrl: '',
  actions: {
    send_message: createAction({
      name: 'send_message',
      displayName: 'Send Message',
      description: 'Send a message to a Telegram chat',
      run: async (context) => {
        const message = context.propsValue.message || context.payload.generatedText;
        const token = context.propsValue.apiKey;
        const chatId = context.propsValue.chatId || 'MOCK_CHAT_ID';
        if (!token) throw new Error('Telegram credentials missing in node properties.');

        const bot = new TelegramBot(token, { polling: false });
        return await bot.sendMessage(chatId, message);
      }
    })
  }
});

// --- Gemini AI Piece ---
const geminiPiece = createPiece({
  name: 'gemini',
  displayName: 'Google Gemini',
  logoUrl: '',
  actions: {
    generate_content: createAction({
      name: 'generate_content',
      displayName: 'Generate Content',
      description: 'Generate text using Gemini 2.5 Flash or Pro',
      run: async (context) => {
        const prompt = context.propsValue.prompt;
        const systemPrompt = context.propsValue.systemPrompt || '';
        const token = context.propsValue.apiKey;
        const model = context.propsValue.model || 'gemini-2.5-flash';
        
        if (!token) {
           return { generatedText: `[MOCK Gemini: Please provide API Key. Prompt: ${prompt?.slice(0, 100)}]` };
        }

        const ai = new GoogleGenAI({ apiKey: token });
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${prompt}` : prompt;
        const response = await ai.models.generateContent({ model, contents: fullPrompt });
        return { generatedText: response.text, model };
      }
    }),

    chat_conversation: createAction({
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

        const ai = new GoogleGenAI({ apiKey: token });
        // Build conversation context
        const conversationText = history.map((m: any) => `${m.role}: ${m.content}`).join('\n');
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

    vision_analyze: createAction({
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
        const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const base64 = Buffer.from(imgResponse.data).toString('base64');
        const mimeType = String(imgResponse.headers['content-type'] || 'image/jpeg');

        const ai = new GoogleGenAI({ apiKey: token });
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

import { knowledgePiece } from './knowledge';

// ─── All Pieces Registry ────────────────────────────────────────────────────
export const pieces: Piece[] = [
  twitterPiece,
  linkedinPiece,
  telegramPiece,
  geminiPiece,
  openaiPiece,
  claudePiece,
  aiUtilsPiece,
  knowledgePiece,
];

export const getPiece = (name: string): Piece | undefined => pieces.find(p => p.name === name);
