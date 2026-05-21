import { TwitterApi } from 'twitter-api-v2';
import { createPiece, createAction } from '../../framework';

const createTweet = createAction({
  name: 'create_tweet',
  displayName: 'Create Tweet',
  description: 'Post a tweet to X/Twitter',
  run: async (context) => {
    const message = context.propsValue.message || context.payload.generatedText;
    
    // Use the apiKey/accessToken field as the OAuth 2.0 Access Token
    const token = context.propsValue.apiKey || context.propsValue.accessToken;
    
    if (!token) {
      throw new Error('Twitter credentials (Access Token) missing in node properties.');
    }

    const client = new TwitterApi(token);

    const { data } = await client.v2.tweet(message);
    return data;
  }
});

export const twitterPiece = createPiece({
  name: 'twitter',
  displayName: 'Twitter / X',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/733/733579.png', // Placeholder URL
  actions: {
    create_tweet: createTweet,
  }
});
