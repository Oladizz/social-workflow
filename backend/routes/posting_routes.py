from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.posting_service import PostingService
from services.scheduler_service import SchedulerService

router = APIRouter(prefix="/api/post", tags=["Auto-Posting"])

class PostRequest(BaseModel):
    content: str
    platform: str

class CrossPostRequest(BaseModel):
    content: str
    platforms: List[str]

class ScheduleRequest(BaseModel):
    content: str
    platform: str
    delay_seconds: int

@router.post("/single")
async def post_single(request: PostRequest):
    result = await PostingService.post_to_platform(request.platform, request.content)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/cross")
async def post_cross(request: CrossPostRequest):
    results = await PostingService.cross_post(request.content, request.platforms)
    return {"results": results}

@router.post("/schedule")
async def schedule_post(request: ScheduleRequest):
    result = SchedulerService.schedule_post(request.content, request.platform, request.delay_seconds)
    return result

@router.get("/scheduled")
async def get_scheduled():
    return SchedulerService.get_jobs()

@router.delete("/scheduled/{job_id}")
async def cancel_job(job_id: str):
    success = SchedulerService.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found or already executed")
    return {"success": True}
