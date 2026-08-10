import { createPiece, createAction } from '../framework';
import axios from 'axios';
import FormData from 'form-data';

// --- YouTube Piece ---
export const youtubePiece = createPiece({
  name: 'youtube',
  displayName: 'YouTube',
  logoUrl: '',
  actions: {
    upload: createAction({
      name: 'upload',
      displayName: 'Upload Video',
      description: 'Upload a video to your YouTube channel',
      run: async (context) => {
        const token = context.propsValue.apiKey;
        const videoUrl = context.propsValue.mediaUrl || context.propsValue.imageUrl;
        const title = context.propsValue.message || 'New Video from Social Workflow';
        const description = context.propsValue.message || 'Generated via Social Workflow';
        
        if (!token) throw new Error('YouTube Access Token is missing in node properties.');
        if (!videoUrl) throw new Error('A Media URL (videoUrl) is required to upload to YouTube.');

        console.log(`[YOUTUBE] Downloading video from: ${videoUrl}`);
        
        // Fetch the video as a stream
        const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
        
        // Prepare metadata
        const metadata = {
          snippet: {
            title: title.slice(0, 100), // Max 100 chars
            description: description,
            tags: ['AI', 'SocialWorkflow'],
            categoryId: '22' // People & Blogs
          },
          status: {
            privacyStatus: 'public' // or 'private'/'unlisted'
          }
        };

        const form = new FormData();
        form.append('metadata', Buffer.from(JSON.stringify(metadata)), { contentType: 'application/json' });
        form.append('file', videoResponse.data, { filename: 'video.mp4', contentType: 'video/mp4' });

        console.log(`[YOUTUBE] Uploading video to YouTube...`);
        
        const uploadRes = await axios.post(
          'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
          form,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              ...form.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );

        console.log(`[YOUTUBE] Upload successful: ${uploadRes.data.id}`);

        return { 
          mediaUrl: `https://youtube.com/watch?v=${uploadRes.data.id}`, 
          videoId: uploadRes.data.id,
          generatedText: `Successfully uploaded to YouTube: https://youtube.com/watch?v=${uploadRes.data.id}`
        };
      }
    }),
  }
});
