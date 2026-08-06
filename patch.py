import sys

# 1. Update backend/main.py
with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

gmail_models = '''
class ScrapeRequest(BaseModel):
    url: str

class GmailDraftRequest(BaseModel):
    to: str
    subject: str
    body: str
'''
content = content.replace('class ActionRequest(TwitterAuthBase):', gmail_models + '\nclass ActionRequest(TwitterAuthBase):')

scrapling_endpoint = '''
@app.post("/api/tools/scrape")
def scrape_website(req: ScrapeRequest):
    try:
        from scrapling import Fetcher
        fetcher = Fetcher()
        page = fetcher.get(req.url)
        # Extract text (Scrapling extracts clean text easily)
        # using the generic text extraction logic
        text_content = page.text_content
        if not text_content:
            text_content = page.page.text_content() # fallback
        return {"success": True, "text": text_content[:5000]} # Limit to 5k chars for now
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/gmail/draft")
def draft_email(req: GmailDraftRequest):
    # This is a mocked implementation since real Gmail OAuth is complex
    return {"success": True, "message": "Email draft created successfully (MOCKED)", "details": {"to": req.to, "subject": req.subject}}
'''

content += '\n' + scrapling_endpoint

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update src/data/platforms.ts
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
plat_content = plat_content.replace('export const PLATFORMS: Platform[] = [', 'export const PLATFORMS: Platform[] = [\n' + gmail_plat)

with open('src/data/platforms.ts', 'w', encoding='utf-8') as f:
    f.write(plat_content)

print('Patched successfully!')
