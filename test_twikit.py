import asyncio
from twikit import Client
import sys

async def main():
    print("=== Twikit Local Test ===")
    username = input("Enter Twitter Username (e.g. Oladizz): ")
    email = input("Enter Twitter Email: ")
    password = input("Enter Twitter Password: ")
    
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
        
        test_tweet = input("\nEnter a message for a test tweet (or press Enter to skip posting): ")
        if test_tweet.strip():
            print(f"Posting tweet: '{test_tweet}'...")
            tweet = await client.create_tweet(text=test_tweet)
            print(f"✅ Tweet posted successfully! Tweet ID: {tweet.id}")
        else:
            print("Skipped posting tweet.")
            
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
