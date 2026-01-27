from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from scraper import scrape_deals
from supabase import create_client

load_dotenv()

app = FastAPI(title="Nursery Scout API")

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "https://nursery-scout.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(supabase_url, supabase_key)


class ScraperRequest(BaseModel):
    brand: str
    item_name: str | None = None
    hunt_id: str
    max_price: int | None = None


@app.post("/api/scout")
async def scout_deals(request: ScraperRequest):
    """
    Scrape eBay and Google Shopping for deals.
    Saves results to Supabase deals table.
    """
    try:
        query = f"{request.brand} {request.item_name or ''}".strip()
        
        print(f"🔍 Scouting for: {query}")
        
        # Scrape both platforms
        deals = await scrape_deals(
            query=query,
            hunt_id=request.hunt_id,
            max_price=request.max_price
        )
        
        return {
            "success": True,
            "query": query,
            "deals_found": len(deals),
            "deals": deals
        }
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
