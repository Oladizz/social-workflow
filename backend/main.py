from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tweepy

app = FastAPI(title="Social Workflow Backend", description="FastAPI Backend for Twitter API v2 (Tweepy)")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Base Model for Authentication (Official API)
class TwitterAuthBase(BaseModel):
    api_key: str
    api_secret: str
    access_token: str
    access_token_secret: str

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

def get_authenticated_client(req: TwitterAuthBase) -> tweepy.Client:
    """Helper function to authenticate and return a Tweepy client."""
    try:
        client = tweepy.Client(
            consumer_key=req.api_key,
            consumer_secret=req.api_secret,
            access_token=req.access_token,
            access_token_secret=req.access_token_secret,
            wait_on_rate_limit=True
        )
        return client
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication setup failed: {str(e)}")


@app.get("/")
def read_root():
    return {"message": "Welcome to Social Workflow Backend! Tweepy API is running."}


@app.post("/api/twitter/post")
def post_tweet(req: TweetRequest):
    try:
        client = get_authenticated_client(req)
        response = client.create_tweet(text=req.text)
        if response.data:
            return {"success": True, "message": "Tweet posted successfully!", "tweet_id": response.data['id']}
        raise Exception("Failed to create tweet - no data returned")
    except tweepy.errors.TweepyException as e:
        raise HTTPException(status_code=400, detail=f"Twitter API Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/twitter/reply")
def reply_tweet(req: ReplyRequest):
    try:
        client = get_authenticated_client(req)
        response = client.create_tweet(text=req.text, in_reply_to_tweet_id=req.tweet_id)
        if response.data:
            return {"success": True, "message": "Replied to tweet successfully!", "tweet_id": response.data['id']}
        raise Exception("Failed to reply - no data returned")
    except tweepy.errors.TweepyException as e:
        raise HTTPException(status_code=400, detail=f"Twitter API Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/twitter/like")
def like_tweet(req: ActionRequest):
    try:
        client = get_authenticated_client(req)
        # We need the user's ID to like a tweet. We can get it from get_me()
        user_response = client.get_me()
        if not user_response.data:
            raise Exception("Could not fetch user ID for liking tweet")
            
        user_id = user_response.data.id
        client.like(tweet_id=req.tweet_id, user_auth=True)
        return {"success": True, "message": f"Successfully liked tweet {req.tweet_id}"}
    except tweepy.errors.TweepyException as e:
        raise HTTPException(status_code=400, detail=f"Twitter API Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/twitter/retweet")
def retweet(req: ActionRequest):
    try:
        client = get_authenticated_client(req)
        user_response = client.get_me()
        if not user_response.data:
            raise Exception("Could not fetch user ID for retweet")
            
        user_id = user_response.data.id
        client.retweet(tweet_id=req.tweet_id, user_auth=True)
        return {"success": True, "message": f"Successfully retweeted {req.tweet_id}"}
    except tweepy.errors.TweepyException as e:
        raise HTTPException(status_code=400, detail=f"Twitter API Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/twitter/dm")
def send_direct_message(req: DMRequest):
    # Note: Twitter API v2 Direct Messages endpoints are limited and usually require OAuth 2.0 or specific access.
    # We will simulate it if it fails or throw a clear error.
    try:
        client = get_authenticated_client(req)
        
        # Get target user ID
        user_response = client.get_user(username=req.target_username)
        if not user_response.data:
            raise HTTPException(status_code=404, detail="Target user not found")
            
        target_user_id = user_response.data.id
        
        # Tweepy v2 create_direct_message is available
        client.create_direct_message(participant_id=target_user_id, text=req.text)
        return {"success": True, "message": f"DM sent successfully to @{req.target_username}"}
    except tweepy.errors.TweepyException as e:
        raise HTTPException(status_code=400, detail=f"Twitter API Error (DMs require appropriate permissions): {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
