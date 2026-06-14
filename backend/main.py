from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from twikit import Client
import asyncio
import os

app = FastAPI(title="Social Workflow Backend", description="FastAPI Backend for Twikit and Automations")

# Configure CORS so the React app can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TweetRequest(BaseModel):
    username: str
    email: str
    password: str
    text: str

@app.get("/")
def read_root():
    return {"message": "Welcome to Social Workflow Backend! API is running."}

@app.post("/api/twitter/post")
async def post_tweet(req: TweetRequest):
    try:
        # Initialize Twikit Client
        client = Client('en-US')
        
        # In a production app, we should save/load cookies to avoid logging in every time
        # For MVP, we will attempt login. Twitter might block repeated logins, 
        # so using cookies is highly recommended later.
        await client.login(
            auth_info_1=req.username,
            auth_info_2=req.email,
            password=req.password
        )

        # Post the tweet
        tweet = await client.create_tweet(text=req.text)

        return {
            "success": True, 
            "message": "Tweet posted successfully!", 
            "tweet_id": tweet.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note: You can add more endpoints here (e.g. reply to tweet, scrape tweets, etc.)
