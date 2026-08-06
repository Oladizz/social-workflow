import sys

# 1. Update src/components/CommandPalette.tsx
with open('src/components/CommandPalette.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

scrape_node = '''
    const tools = [
      { id: 'scrapeNode', label: 'Web Scraper', desc: 'Extract text from any website URL', color: '#14b8a6', emoji: '???' }
    ].map(n => ({
      id: n.id, label: n.label, description: n.desc, category: 'Tools',
      icon: <span style={{ fontSize: '13px' }}>{n.emoji}</span>,
      action: () => { addNode('logic' as any, { nodeType: n.id }); toast.info(n.label + ' added'); onClose(); }
    }));
'''
content = content.replace('const socials = PLATFORMS.map(p => {', scrape_node + '\n    const socials = PLATFORMS.map(p => {', 1)
content = content.replace('return [...triggers, ...logic, ...ai, ...socials];', 'return [...triggers, ...logic, ...ai, ...tools, ...socials];', 1)

with open('src/components/CommandPalette.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update src/utils/executor.ts
with open('src/utils/executor.ts', 'r', encoding='utf-8') as f:
    exec_content = f.read()

gmail_exec = '''        } else if (platform === 'gmail') {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
          let endpoint = '/api/gmail/draft';
          
          let payload = {
            to: inputData.to || 'test@example.com',
            subject: inputData.subject || 'Automated Email',
            body: inputData.body || inputData.content || node.data.message || 'Hello from Social Workflow!'
          };

          const response = await fetch(${backendUrl}, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) throw new Error('Gmail API failed');
          output = await response.json();
        } else {'''

scrape_exec = '''      } else if (node.type === 'logic' && node.data.nodeType === 'scrapeNode') {
        const url = node.data.url || node.data.input || 'https://example.com';
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(${backendUrl}/api/tools/scrape, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        if (!response.ok) throw new Error('Scraping failed');
        output = await response.json();
      } else if (node.type === 'delayNode') {'''

exec_content = exec_content.replace('        } else {\n          // Placeholder for other platforms', gmail_exec + '\n          // Placeholder for other platforms', 1)
exec_content = exec_content.replace("      } else if (node.type === 'delayNode') {", scrape_exec, 1)

with open('src/utils/executor.ts', 'w', encoding='utf-8') as f:
    f.write(exec_content)

# 3. Update src/data/platforms.ts
with open('src/data/platforms.ts', 'r', encoding='utf-8') as f:
    plat_content = f.read()

gmail_plat = '''  {
    id: 'gmail',
    name: 'Gmail',
    color: '#EA4335',
    bgGradient: 'linear-gradient(135deg, #EA4335, #C5221F)',
    IconComponent: () => <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>,
    actions: [
      { id: 'draft', label: 'Draft Email', icon: '??', description: 'Create a draft email' },
      { id: 'send', label: 'Send Email', icon: '??', description: 'Send an email directly' },
    ]
  },'''
plat_content = plat_content.replace('export const PLATFORMS: Platform[] = [', 'export const PLATFORMS: Platform[] = [\n' + gmail_plat, 1)

with open('src/data/platforms.ts', 'w', encoding='utf-8') as f:
    f.write(plat_content)

print('Patched successfully!')
