export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  platform: string; // twitter, linkedin, reddit, etc.
  product: string; // tymio, nuro, finflow, qryntal, store, phonetech, all
  category: 'launch' | 'engagement' | 'tutorial' | 'behind-the-scenes' | 'weekly-recap';
  template: string; // with {{PRODUCT_NAME}}, {{FEATURE}}, {{LINK}}, {{TAGLINE}} variables
  hashtags: string[];
}

export const contentTemplates: ContentTemplate[] = [
  {
    id: 'launch-tweet',
    name: 'Launch Tweet',
    description: 'The perfect tweet for launching a new product or feature.',
    platform: 'twitter',
    product: 'all',
    category: 'launch',
    template: 'I just launched {{PRODUCT_NAME}} 🚀\n\n{{TAGLINE}}\n\n→ {{FEATURE}}\n\nIt\'s free. No catch.\n\nTry it: {{LINK}}\n\nRT to help a solo builder out 🙏',
    hashtags: ['#buildinpublic', '#indiehackers', '#launch']
  },
  {
    id: 'reddit-launch',
    name: 'Reddit Launch Post',
    description: 'A value-driven post for Reddit communities.',
    platform: 'reddit',
    product: 'all',
    category: 'launch',
    template: 'Hey r/entrepreneur,\n\nI spent the last 3 months building {{PRODUCT_NAME}}.\n\n{{TAGLINE}}\n\nHere is how I solved the core problem: {{FEATURE}}.\n\nWould love your honest feedback: {{LINK}}',
    hashtags: []
  },
  {
    id: 'bip-tweet',
    name: 'Build In Public',
    description: 'Share a transparent update about your journey.',
    platform: 'twitter',
    product: 'all',
    category: 'behind-the-scenes',
    template: 'Building {{PRODUCT_NAME}} - Update 🚀\n\nJust shipped: {{FEATURE}}.\n\nThe hardest part was getting the UX right. What do you think?\n\n{{LINK}}',
    hashtags: ['#buildinpublic', '#SaaS']
  },
  {
    id: 'product-demo',
    name: 'Product Demo Caption',
    description: 'Caption for a short video demo of your product.',
    platform: 'instagram',
    product: 'all',
    category: 'tutorial',
    template: 'See {{PRODUCT_NAME}} in action! 👀\n\nCheck out our new {{FEATURE}} that makes your life easier.\n\n{{TAGLINE}}\n\nLink in bio to try it out! 🔗\n\n{{LINK}}',
    hashtags: ['#tech', '#startup', '#demo']
  },
  {
    id: 'weekly-recap',
    name: 'Weekly Recap Thread',
    description: 'Summarize the wins and learnings of the week.',
    platform: 'twitter',
    product: 'all',
    category: 'weekly-recap',
    template: 'It\'s been a crazy week building {{PRODUCT_NAME}}.\n\nHere\'s what we accomplished:\n- {{FEATURE}}\n- 50 new users\n- Fixed 10 bugs\n\nWhat are you working on this weekend?\n\n{{LINK}}',
    hashtags: ['#weeklyrecap', '#founders']
  },
  {
    id: 'linkedin-article',
    name: 'LinkedIn Article Intro',
    description: 'A professional hook for a long-form article.',
    platform: 'linkedin',
    product: 'all',
    category: 'engagement',
    template: 'The landscape is changing rapidly. I\'m excited to share how {{PRODUCT_NAME}} is adapting.\n\n{{TAGLINE}}\n\nOne of the key things we focused on is {{FEATURE}}.\n\nRead the full article to see our vision: {{LINK}}',
    hashtags: ['#innovation', '#technology', '#leadership']
  },
  {
    id: 'cross-platform',
    name: 'Cross-platform Announcement',
    description: 'Generic announcement suitable for any platform.',
    platform: 'all',
    product: 'all',
    category: 'launch',
    template: 'Big news! {{PRODUCT_NAME}} is now live! 🎉\n\n{{TAGLINE}}\n\nDon\'t miss out on {{FEATURE}}.\n\nCheck it out here: {{LINK}}',
    hashtags: ['#announcement', '#newfeature']
  },
  {
    id: 'daily-rotation',
    name: 'Daily Content Rotation (Mon-Sun)',
    description: 'A dynamic template that adapts to the day of the week.',
    platform: 'all',
    product: 'all',
    category: 'engagement',
    template: 'Happy {{DAY_OF_WEEK}}!\n\nHere is a quick tip for using {{PRODUCT_NAME}}: {{FEATURE}}.\n\n{{TAGLINE}}\n\nCheck it out: {{LINK}}',
    hashtags: ['#dailyupdate', '#productivity']
  }
];