import httpx
import os
from datetime import datetime

class PostingService:
    @staticmethod
    async def post_to_platform(platform: str, content: str, credentials: dict = None) -> dict:
        """
        Unified posting logic.
        """
        platform = platform.lower()
        
        try:
            if platform == 'discord':
                webhook_url = os.getenv("DISCORD_WEBHOOK_URL", "")
                if not webhook_url:
                    return {"error": "DISCORD_WEBHOOK_URL missing"}
                
                async with httpx.AsyncClient() as client:
                    res = await client.post(webhook_url, json={"content": content})
                    if res.status_code in [200, 204]:
                        return {"success": True, "platform": "discord"}
                    return {"error": f"Discord error {res.status_code}"}
                    
            elif platform == 'telegram':
                bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
                chat_id = os.getenv("TELEGRAM_CHAT_ID", "") # Optionally passed in credentials
                
                if not bot_token or not chat_id:
                    return {"error": "Telegram credentials missing"}
                    
                url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                async with httpx.AsyncClient() as client:
                    res = await client.post(url, json={"chat_id": chat_id, "text": content})
                    if res.status_code == 200:
                        return {"success": True, "platform": "telegram"}
                    return {"error": f"Telegram error {res.status_code}"}
                    
            elif platform == 'twitter':
                # Re-use existing executor.ts logic pattern (which calls local Next/Express API usually)
                # Or use postproxy if configured
                return {"error": "Twitter direct posting requires OAuth 1.0a auth. Use Postproxy."}
                
            else:
                # Unified Postproxy API (for LinkedIn, Reddit, FB, Twitter)
                postproxy_key = os.getenv("POSTPROXY_API_KEY", "")
                if not postproxy_key:
                    # Mock successful post for demo if no API key
                    return {"success": True, "platform": platform, "mock": True}
                    
                url = "https://api.postproxy.dev/v1/posts"
                async with httpx.AsyncClient() as client:
                    res = await client.post(
                        url,
                        headers={"Authorization": f"Bearer {postproxy_key}"},
                        json={
                            "content": content,
                            "platforms": [platform]
                        }
                    )
                    
                if res.status_code == 200:
                    return {"success": True, "platform": platform}
                return {"error": f"Postproxy error {res.status_code}"}
                
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    async def cross_post(content: str, platforms: list, credentials: dict = None) -> list:
        results = []
        for p in platforms:
            res = await PostingService.post_to_platform(p, content, credentials)
            results.append(res)
        return results
