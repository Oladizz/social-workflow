"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twitterPiece = void 0;
const twitter_api_v2_1 = require("twitter-api-v2");
const framework_1 = require("../../framework");
const createTweet = (0, framework_1.createAction)({
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
        const client = new twitter_api_v2_1.TwitterApi(token);
        const { data } = await client.v2.tweet(message);
        return data;
    }
});
exports.twitterPiece = (0, framework_1.createPiece)({
    name: 'twitter',
    displayName: 'Twitter / X',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/733/733579.png', // Placeholder URL
    actions: {
        create_tweet: createTweet,
    }
});
//# sourceMappingURL=index.js.map