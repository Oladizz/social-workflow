import { createPiece, createAction } from '../framework';
import axios from 'axios';

// --- Luma AI Piece (Dream Machine) ---
export const lumaPiece = createPiece({
  name: 'luma',
  displayName: 'Luma AI',
  logoUrl: '',
  actions: {
    generate_video: createAction({
      name: 'generate_video',
      displayName: 'Generate Video',
      description: 'Generate a video from a text prompt or image using Luma Dream Machine',
      run: async (context) => {
        const token = context.propsValue.apiKey;
        const prompt = context.propsValue.prompt;
        const imageUrl = context.propsValue.imageUrl;
        
        if (!token) throw new Error('Luma API Key missing in node properties.');
        if (!prompt) throw new Error('Video prompt is required.');

        // Initialize Generation
        const payload: any = {
          prompt: prompt,
          model: 'dream-machine', // Currently the API standard model
          aspect_ratio: "16:9"
        };
        
        if (imageUrl) {
          payload.keyframes = {
            frame0: {
              type: "image",
              url: imageUrl
            }
          };
        }

        const createRes = await axios.post('https://api.lumalabs.ai/dream-machine/v1/generations', payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const generationId = createRes.data.id;
        console.log(`[LUMA] Generation started: ${generationId}`);

        // Polling loop for completion (Luma usually takes 1-3 mins)
        // Note: For a robust orchestrator, long-polling should be done asynchronously 
        // with webhooks, but we use a short polling loop here for simplicity.
        let videoUrl = '';
        let status = createRes.data.state;
        let attempts = 0;
        
        while (status !== 'completed' && status !== 'failed' && attempts < 30) {
          await new Promise(r => setTimeout(r, 10000)); // wait 10s
          attempts++;
          
          const pollRes = await axios.get(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          status = pollRes.data.state;
          console.log(`[LUMA] Polling generation ${generationId}: ${status}`);
          
          if (status === 'completed') {
            videoUrl = pollRes.data.assets.video;
          }
        }
        
        if (status === 'failed') {
          throw new Error('Luma video generation failed.');
        }
        if (!videoUrl) {
          throw new Error('Luma video generation timed out.');
        }

        return { mediaUrl: videoUrl, generatedText: 'Video generated successfully.', generationId };
      }
    }),
  }
});
