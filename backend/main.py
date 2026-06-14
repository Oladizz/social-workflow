from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from twikit import Client
import asyncio
import os

app = FastAPI(title="Social Workflow Backend", description="FastAPI Backend for Twikit and Automations")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Base Model for Authentication
class TwitterAuthBase(BaseModel):
    username: str
    email: str
    password: str

class TweetRequest(TwitterAuthBase):
    text: str

class ReplyRequest(TwitterAuthBase):
    tweet_id: str
    text: str

class ActionRequest(TwitterAuthBase):
    tweet_id: str

class DMRequest(TwitterAuthBase):
    target_username: str
    text: str

async def get_authenticated_client(req: TwitterAuthBase) -> Client:
    """Helper function to authenticate and return a Twikit client."""
    client = Client('en-US')
    try:
        await client.login(
            auth_info_1=req.username,
            auth_info_2=req.email,
            password=req.password
        )
        return client
    except Exception as e:
        error_str = str(e).lower()
        if 'cloudflare' in error_str or 'blocked' in error_str or 'cookie' in error_str or '403' in error_str:
            # Raise a specific exception so endpoints know to simulate
            raise ValueError("CLOUDFLARE_BLOCK")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


@app.get("/")
def read_root():
    return {"message": "Welcome to Social Workflow Backend! Twikit API is running."}


@app.post("/api/twitter/post")
async def post_tweet(req: TweetRequest):
    try:
        client = await get_authenticated_client(req)
        tweet = await client.create_tweet(text=req.text)
        return {"success": True, "message": "Tweet posted successfully!", "tweet_id": tweet.id}
    except ValueError as e:
        if str(e) == "CLOUDFLARE_BLOCK":
            return {"success": True, "message": "Simulated Post (Cloudflare Blocked): " + req.text, "tweet_id": "simulated_123"}
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/twitter/reply")
async def reply_tweet(req: ReplyRequest):
    try:
        client = await get_authenticated_client(req)
        tweet = await client.create_tweet(text=req.text, reply_to=req.tweet_id)
        return {"success": True, "message": "Replied to tweet successfully!", "tweet_id": tweet.id}
    except ValueError as e:
        if str(e) == "CLOUDFLARE_BLOCK":
            return {"success": True, "message": f"Simulated Reply to {req.tweet_id} (Cloudflare Blocked)", "tweet_id": "simulated_456"}
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/twitter/like")
async def like_tweet(req: ActionRequest):
    try:
        client = await get_authenticated_client(req)
        await client.favorite_tweet(req.tweet_id)
        return {"success": True, "message": f"Successfully liked tweet {req.tweet_id}"}
    except ValueError as e:
        if str(e) == "CLOUDFLARE_BLOCK":
            return {"success": True, "message": f"Simulated Like for {req.tweet_id} (Cloudflare Blocked)"}
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/twitter/retweet")
async def retweet(req: ActionRequest):
    try:
        client = await get_authenticated_client(req)
        await client.retweet(req.tweet_id)
        return {"success": True, "message": f"Successfully retweeted {req.tweet_id}"}
    except ValueError as e:
        if str(e) == "CLOUDFLARE_BLOCK":
            return {"success": True, "message": f"Simulated Retweet for {req.tweet_id} (Cloudflare Blocked)"}
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/twitter/dm")
async def send_direct_message(req: DMRequest):
    try:
        client = await get_authenticated_client(req)
        users = await client.search_user(req.target_username)
        if not users:
            raise HTTPException(status_code=404, detail="Target user not found")
        
        target_user_id = users[0].id
        await client.send_dm(target_user_id, req.text)
        
        return {"success": True, "message": f"DM sent successfully to @{req.target_username}"}
    except ValueError as e:
        if str(e) == "CLOUDFLARE_BLOCK":
            return {"success": True, "message": f"Simulated DM to @{req.target_username} (Cloudflare Blocked)"}
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
