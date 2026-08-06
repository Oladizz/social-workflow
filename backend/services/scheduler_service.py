import uuid
from datetime import datetime
import asyncio
from services.posting_service import PostingService

# In a real app, this would use APScheduler and Firebase Firestore.
# For simplicity in this demo, we maintain an in-memory job store.
scheduled_jobs = {}

class SchedulerService:
    
    @staticmethod
    async def execute_job(job_id: str, content: str, platform: str):
        print(f"Executing scheduled job {job_id} for {platform}...")
        result = await PostingService.post_to_platform(platform, content)
        if job_id in scheduled_jobs:
            scheduled_jobs[job_id]["status"] = "posted"
            scheduled_jobs[job_id]["result"] = result
        print(f"Job {job_id} completed: {result}")

    @staticmethod
    def schedule_post(content: str, platform: str, delay_seconds: int) -> dict:
        job_id = str(uuid.uuid4())
        
        scheduled_jobs[job_id] = {
            "id": job_id,
            "content": content,
            "platform": platform,
            "status": "scheduled",
            "scheduled_time": datetime.utcnow().isoformat()
        }
        
        # Schedule the coroutine
        loop = asyncio.get_event_loop()
        loop.call_later(
            delay_seconds, 
            lambda: asyncio.create_task(SchedulerService.execute_job(job_id, content, platform))
        )
        
        return scheduled_jobs[job_id]

    @staticmethod
    def get_jobs() -> list:
        return list(scheduled_jobs.values())

    @staticmethod
    def cancel_job(job_id: str) -> bool:
        if job_id in scheduled_jobs and scheduled_jobs[job_id]["status"] == "scheduled":
            scheduled_jobs[job_id]["status"] = "cancelled"
            return True
        return False
