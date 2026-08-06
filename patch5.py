import sys

with open('src/data/platforms.ts', 'r', encoding='utf-8') as f:
    plat_content = f.read()

# Add import at the top
plat_content = plat_content.replace("import { FaTwitter", "import { SiGmail } from 'react-icons/si';\nimport { FaTwitter", 1)

gmail_plat = '''  {
    id: 'gmail',
    name: 'Gmail',
    color: '#EA4335',
    bgGradient: 'linear-gradient(135deg, #EA4335, #C5221F)',
    IconComponent: SiGmail,
    actions: [
      { id: 'draft', label: 'Draft Email', icon: '??', description: 'Create a draft email' },
      { id: 'send', label: 'Send Email', icon: '??', description: 'Send an email directly' },
    ]
  },'''

plat_content = plat_content.replace('export const PLATFORMS: Platform[] = [', 'export const PLATFORMS: Platform[] = [\n' + gmail_plat, 1)

with open('src/data/platforms.ts', 'w', encoding='utf-8') as f:
    f.write(plat_content)

print('Patched platforms.ts!')
