import { createPiece, createAction } from '../../framework';
import axios from 'axios';

// ─── OpenAI Piece ─────────────────────────────────────────────────────────────
export const openaiPiece = createPiece({
  name: 'openai',
  displayName: 'OpenAI',
  logoUrl: '',
  actions: {
    generate_text: createAction({
      name: 'generate_text',
      displayName: 'Generate Text (Chat)',
      description: 'Generate text using GPT-4o, GPT-4o-mini, or o3-mini',
      run: async (context) => {
        const apiKey = context.propsValue.apiKey;
        const model = context.propsValue.model || 'gpt-4o-mini';
        const prompt = context.propsValue.prompt || '';
        const systemPrompt = context.propsValue.systemPrompt || '';
        const temperature = Number(context.propsValue.temperature) || 0.7;
        const maxTokens = Number(context.propsValue.maxTokens) || 1024;

        if (!apiKey) {
          return { generatedText: `[MOCK OpenAI: No API key. Prompt: ${prompt.slice(0, 100)}]` };
        }

        const messages: any[] = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model, messages, temperature, max_tokens: maxTokens,
        }, {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 60000,
        });

        const text = response.data.choices?.[0]?.message?.content || '';
        return {
          generatedText: text,
          model,
          usage: response.data.usage,
          finishReason: response.data.choices?.[0]?.finish_reason,
        };
      }
    }),

    chat_conversation: createAction({
      name: 'chat_conversation',
      displayName: 'Multi-Turn Chat',
      description: 'Continue a multi-turn conversation with memory',
      run: async (context) => {
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

        const messages: any[] = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push(...history);
        messages.push({ role: 'user', content: newMessage });

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model, messages, temperature,
        }, {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 60000,
        });

        const reply = response.data.choices?.[0]?.message?.content || '';
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

    vision_analyze: createAction({
      name: 'vision_analyze',
      displayName: 'Analyze Image (Vision)',
      description: 'Analyze an image using GPT-4o vision capabilities',
      run: async (context) => {
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

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model, messages, max_tokens: 1024,
        }, {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 60000,
        });

        return {
          generatedText: response.data.choices?.[0]?.message?.content || '',
          model,
        };
      }
    }),

    transcribe_audio: createAction({
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
        const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const FormData = (await import('form-data')).default;
        const form = new FormData();
        form.append('file', Buffer.from(audioResponse.data), { filename: 'audio.mp3', contentType: 'audio/mpeg' });
        form.append('model', 'whisper-1');
        form.append('language', language);

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
          headers: { 'Authorization': `Bearer ${apiKey}`, ...form.getHeaders() },
          timeout: 120000,
        });

        return { transcription: response.data.text, language };
      }
    }),

    text_to_speech: createAction({
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

        const response = await axios.post('https://api.openai.com/v1/audio/speech', {
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
