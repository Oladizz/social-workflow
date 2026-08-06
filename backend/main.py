import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import uvicorn

app = FastAPI(title="Social Workflow Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    scheduler.start()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
