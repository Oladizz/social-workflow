import asyncio
from twikit import Client
import sys

async def main():
    print("=== Twikit Local Test ===")
    username = "snycnode"
    email = "snycnode@gmail.com"
    password = "Snycnode@1234"
    
    print("\nInitializing Twikit Client...")
    client = Client('en-US')
    
    try:
        print("Attempting to login...")
        await client.login(
            auth_info_1=username,
            auth_info_2=email,
            password=password
        )
        print("✅ Login Successful!")
        
        test_tweet = "Hello from Cirlo Automations! Testing my new AI Workflow Builder locally! 🚀"
        print(f"Posting tweet: '{test_tweet}'...")
        tweet = await client.create_tweet(text=test_tweet)
        print(f"✅ Tweet posted successfully! Tweet ID: {tweet.id}")
            
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
