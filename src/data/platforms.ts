// Platform Registry: defines every supported social platform with its actions, brand color, and icon component
import { 
  FaTwitter, FaLinkedin, FaFacebook, FaInstagram, FaReddit, FaDiscord, 
  FaTelegram, FaYoutube, FaTiktok, FaMedium, FaPinterest, FaGithub
} from 'react-icons/fa';
import React from 'react';

export interface PlatformAction {
  id: string;
  label: string;
  icon: string; // emoji
  description: string;
}

export interface Platform {
  id: string;
  name: string;
  color: string;
  bgGradient: string;
  IconComponent: React.ComponentType<{ size?: number; color?: string }>;
  actions: PlatformAction[];
}

export const PLATFORMS: Platform[] = [
  {
    id: 'twitter',
    name: 'X / Twitter',
    color: '#000000',
    bgGradient: 'linear-gradient(135deg, #1a1a1a, #000)',
    IconComponent: FaTwitter,
    actions: [
      { id: 'tweet', label: 'Post Tweet', icon: '📝', description: 'Post a new tweet to your timeline' },
      { id: 'reply', label: 'Reply to Tweet', icon: '↩️', description: 'Reply to a specific tweet' },
      { id: 'retweet', label: 'Retweet', icon: '🔁', description: 'Retweet a post' },
      { id: 'like', label: 'Like Tweet', icon: '❤️', description: 'Like a tweet' },
      { id: 'dm', label: 'Send DM', icon: '💬', description: 'Send a direct message' },
      { id: 'follow', label: 'Follow User', icon: '➕', description: 'Follow a user' },
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    bgGradient: 'linear-gradient(135deg, #0A66C2, #004182)',
    IconComponent: FaLinkedin,
    actions: [
      { id: 'post', label: 'Create Post', icon: '📝', description: 'Post to your LinkedIn feed' },
      { id: 'article', label: 'Publish Article', icon: '📄', description: 'Publish a long-form article' },
      { id: 'comment', label: 'Comment', icon: '💬', description: 'Comment on a post' },
      { id: 'like', label: 'Like Post', icon: '👍', description: 'Like a post' },
      { id: 'connect', label: 'Send Connection', icon: '🤝', description: 'Send a connection request' },
      { id: 'message', label: 'Send Message', icon: '✉️', description: 'Send a direct message' },
    ]
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    bgGradient: 'linear-gradient(135deg, #1877F2, #0d4fc4)',
    IconComponent: FaFacebook,
    actions: [
      { id: 'post', label: 'Create Post', icon: '📝', description: 'Post to your Facebook page or timeline' },
      { id: 'comment', label: 'Comment', icon: '💬', description: 'Comment on a post' },
      { id: 'like', label: 'Like Post', icon: '👍', description: 'Like a post' },
      { id: 'share', label: 'Share Post', icon: '🔗', description: 'Share a post' },
      { id: 'story', label: 'Post Story', icon: '⭕', description: 'Post a story' },
      { id: 'message', label: 'Send Message', icon: '✉️', description: 'Send a Messenger message' },
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    bgGradient: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    IconComponent: FaInstagram,
    actions: [
      { id: 'post', label: 'Post Image', icon: '🖼️', description: 'Post an image to your feed' },
      { id: 'reel', label: 'Post Reel', icon: '🎬', description: 'Post a short-form video reel' },
      { id: 'story', label: 'Post Story', icon: '⭕', description: 'Post to your story' },
      { id: 'comment', label: 'Comment', icon: '💬', description: 'Comment on a post' },
      { id: 'like', label: 'Like Post', icon: '❤️', description: 'Like a post' },
      { id: 'dm', label: 'Send DM', icon: '✉️', description: 'Send a direct message' },
    ]
  },
  {
    id: 'reddit',
    name: 'Reddit',
    color: '#FF4500',
    bgGradient: 'linear-gradient(135deg, #FF4500, #cc3700)',
    IconComponent: FaReddit,
    actions: [
      { id: 'post', label: 'Submit Post', icon: '📝', description: 'Submit a new post to a subreddit' },
      { id: 'comment', label: 'Comment', icon: '💬', description: 'Comment on a post' },
      { id: 'upvote', label: 'Upvote', icon: '⬆️', description: 'Upvote a post or comment' },
      { id: 'crosspost', label: 'Crosspost', icon: '🔁', description: 'Crosspost to another subreddit' },
      { id: 'message', label: 'Send Message', icon: '✉️', description: 'Send a direct message' },
    ]
  },
  {
    id: 'discord',
    name: 'Discord',
    color: '#5865F2',
    bgGradient: 'linear-gradient(135deg, #5865F2, #3d4aba)',
    IconComponent: FaDiscord,
    actions: [
      { id: 'message', label: 'Send Message', icon: '💬', description: 'Send a message to a channel' },
      { id: 'dm', label: 'Send DM', icon: '✉️', description: 'Send a direct message to a user' },
      { id: 'reaction', label: 'Add Reaction', icon: '😀', description: 'React to a message' },
      { id: 'thread', label: 'Create Thread', icon: '🧵', description: 'Create a thread from a message' },
      { id: 'webhook', label: 'Webhook Post', icon: '🪝', description: 'Post via webhook' },
    ]
  },
  {
    id: 'telegram',
    name: 'Telegram',
    color: '#0088cc',
    bgGradient: 'linear-gradient(135deg, #0088cc, #005c8a)',
    IconComponent: FaTelegram,
    actions: [
      { id: 'message', label: 'Send Message', icon: '💬', description: 'Send a message to a chat or group' },
      { id: 'photo', label: 'Send Photo', icon: '🖼️', description: 'Send a photo' },
      { id: 'file', label: 'Send File', icon: '📎', description: 'Send a file' },
      { id: 'poll', label: 'Create Poll', icon: '📊', description: 'Create a poll in a group' },
      { id: 'channel', label: 'Post to Channel', icon: '📡', description: 'Post to a Telegram channel' },
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    bgGradient: 'linear-gradient(135deg, #FF0000, #cc0000)',
    IconComponent: FaYoutube,
    actions: [
      { id: 'comment', label: 'Post Comment', icon: '💬', description: 'Comment on a video' },
      { id: 'like', label: 'Like Video', icon: '👍', description: 'Like a video' },
      { id: 'subscribe', label: 'Subscribe', icon: '🔔', description: 'Subscribe to a channel' },
      { id: 'community', label: 'Community Post', icon: '📝', description: 'Post to your community tab' },
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#010101',
    bgGradient: 'linear-gradient(135deg, #010101, #69C9D0)',
    IconComponent: FaTiktok,
    actions: [
      { id: 'comment', label: 'Post Comment', icon: '💬', description: 'Comment on a video' },
      { id: 'like', label: 'Like Video', icon: '❤️', description: 'Like a video' },
      { id: 'follow', label: 'Follow User', icon: '➕', description: 'Follow a creator' },
      { id: 'share', label: 'Share Video', icon: '🔗', description: 'Share a video' },
    ]
  },
  {
    id: 'medium',
    name: 'Medium',
    color: '#00ab6c',
    bgGradient: 'linear-gradient(135deg, #00ab6c, #007a4e)',
    IconComponent: FaMedium,
    actions: [
      { id: 'post', label: 'Publish Article', icon: '📝', description: 'Publish a Medium article' },
      { id: 'response', label: 'Post Response', icon: '↩️', description: 'Post a response to an article' },
      { id: 'clap', label: 'Clap', icon: '👏', description: 'Clap for an article' },
    ]
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#E60023',
    bgGradient: 'linear-gradient(135deg, #E60023, #a8001a)',
    IconComponent: FaPinterest,
    actions: [
      { id: 'pin', label: 'Create Pin', icon: '📌', description: 'Create a new pin on a board' },
      { id: 'save', label: 'Save Pin', icon: '🔖', description: 'Save a pin to a board' },
      { id: 'comment', label: 'Comment', icon: '💬', description: 'Comment on a pin' },
    ]
  },
  {
    id: 'github',
    name: 'GitHub',
    color: '#24292e',
    bgGradient: 'linear-gradient(135deg, #24292e, #0d1117)',
    IconComponent: FaGithub,
    actions: [
      { id: 'issue', label: 'Create Issue', icon: '🐛', description: 'Create a new GitHub issue' },
      { id: 'star', label: 'Star Repo', icon: '⭐', description: 'Star a repository' },
      { id: 'comment', label: 'Comment', icon: '💬', description: 'Comment on an issue or PR' },
      { id: 'release', label: 'Create Release', icon: '🚀', description: 'Create a new release' },
    ]
  },
];

export const getPlatformById = (id: string): Platform | undefined => PLATFORMS.find(p => p.id === id);
