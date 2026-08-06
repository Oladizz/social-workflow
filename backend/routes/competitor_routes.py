from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.competitor_service import CompetitorService

router = APIRouter(prefix="/api/spy", tags=["Competitor Spy"])

class StoreRequest(BaseModel):
    url: str

class TrendRequest(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None

class AdRequest(BaseModel):
    query: str

@router.post("/analyze-store")
async def analyze_store(request: StoreRequest):
    result = await CompetitorService.analyze_shopify_store(request.url)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/trends")
async def get_trends(request: TrendRequest):
    result = await CompetitorService.fetch_trending_products(request.category, request.query)
    if result and "error" in result[0]:
        raise HTTPException(status_code=400, detail=result[0]["error"])
    return result

@router.post("/ad-search")
async def search_ads(request: AdRequest):
    result = await CompetitorService.search_meta_ads(request.query)
    if result and "error" in result[0]:
        raise HTTPException(status_code=400, detail=result[0]["error"])
    return result
