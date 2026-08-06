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
content = content.replace('const socials = PLATFORMS.map(p => {', scrape_node + '\n    const socials = PLATFORMS.map(p => {')
content = content.replace('return [...triggers, ...logic, ...ai, ...socials];', 'return [...triggers, ...logic, ...ai, ...tools, ...socials];')

with open('src/components/CommandPalette.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update src/utils/executor.ts
with open('src/utils/executor.ts', 'r', encoding='utf-8') as f:
    exec_content = f.read()

gmail_exec = '''
        } else if (platform === 'gmail') {
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
'''

scrape_exec = '''
      } else if (node.type === 'logic' && node.data.nodeType === 'scrapeNode') {
        const url = node.data.url || node.data.input || 'https://example.com';
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(${backendUrl}/api/tools/scrape, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        if (!response.ok) throw new Error('Scraping failed');
        output = await response.json();
'''

exec_content = exec_content.replace('} else {', gmail_exec + '\n        } else {')
exec_content = exec_content.replace("} else if (node.type === 'delayNode') {", scrape_exec + "\n      } else if (node.type === 'delayNode') {")

with open('src/utils/executor.ts', 'w', encoding='utf-8') as f:
    f.write(exec_content)

print('Patched executor and palette!')
