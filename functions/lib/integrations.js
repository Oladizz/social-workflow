"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToFacebook = exports.postToMedium = exports.postToReddit = exports.postToTelegram = exports.postToLinkedIn = exports.postToTwitter = void 0;
const axios_1 = __importDefault(require("axios"));
const twitter_api_v2_1 = require("twitter-api-v2");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
// --- Twitter ---
const postToTwitter = async (message) => {
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;
    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
        throw new Error('Twitter credentials missing in environment variables.');
    }
    const client = new twitter_api_v2_1.TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
    });
    const { data } = await client.v2.tweet(message);
    return data;
};
exports.postToTwitter = postToTwitter;
// --- LinkedIn ---
const postToLinkedIn = async (message) => {
    const token = process.env.LINKEDIN_ACCESS_TOKEN;
    const authorUrn = process.env.LINKEDIN_AUTHOR_URN; // e.g., urn:li:person:12345
    if (!token || !authorUrn) {
        throw new Error('LinkedIn credentials missing in environment variables.');
    }
    const payload = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: message },
                shareMediaCategory: 'NONE'
            }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
    };
    const response = await axios_1.default.post('https://api.linkedin.com/v2/ugcPosts', payload, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};
exports.postToLinkedIn = postToLinkedIn;
// --- Telegram ---
const postToTelegram = async (message) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
        throw new Error('Telegram credentials missing in environment variables.');
    }
    const bot = new node_telegram_bot_api_1.default(token, { polling: false });
    const result = await bot.sendMessage(chatId, message);
    return result;
};
exports.postToTelegram = postToTelegram;
// --- Reddit ---
const postToReddit = async (message, title = 'Automated Post') => {
    const token = process.env.REDDIT_ACCESS_TOKEN;
    const subreddit = process.env.REDDIT_SUBREDDIT;
    if (!token || !subreddit) {
        throw new Error('Reddit credentials missing in environment variables.');
    }
    const response = await axios_1.default.post('https://oauth.reddit.com/api/submit', null, {
        params: {
            sr: subreddit,
            kind: 'self',
            title: title,
            text: message
        },
        headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'SocialWorkflowBot/1.0.0'
        }
    });
    return response.data;
};
exports.postToReddit = postToReddit;
// --- Medium ---
const postToMedium = async (message, title = 'Automated Post') => {
    const token = process.env.MEDIUM_INTEGRATION_TOKEN;
    const authorId = process.env.MEDIUM_AUTHOR_ID;
    if (!token || !authorId) {
        throw new Error('Medium credentials missing in environment variables.');
    }
    const payload = {
        title: title,
        contentFormat: 'markdown',
        content: message,
        publishStatus: 'public'
    };
    const response = await axios_1.default.post(`https://api.medium.com/v1/users/${authorId}/posts`, payload, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    return response.data;
};
exports.postToMedium = postToMedium;
// --- Facebook ---
const postToFacebook = async (message) => {
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;
    if (!pageAccessToken || !pageId) {
        throw new Error('Facebook credentials missing in environment variables.');
    }
    const response = await axios_1.default.post(`https://graph.facebook.com/v18.0/${pageId}/feed`, null, {
        params: {
            message: message,
            access_token: pageAccessToken
        }
    });
    return response.data;
};
exports.postToFacebook = postToFacebook;
//# sourceMappingURL=integrations.js.map