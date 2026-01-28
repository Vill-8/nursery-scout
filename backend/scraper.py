import asyncio
from datetime import datetime
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(supabase_url, supabase_key)


async def scrape_google_shopping(query: str, max_price: int | None = None):
    """Mock Google Shopping scraper"""
    # Return mock deals for now to test the flow
    return [
        {
            "title": f"Google Shopping: {query} - Premium Deal",
            "price": 149.99,
            "url": f"https://www.google.com/search?q={query.replace(' ', '+')}",
            "store": "Google Shopping",
            "platform": "google_shopping"
        },
        {
            "title": f"Google Shopping: {query} - Budget Option",
            "price": 99.99,
            "url": f"https://www.google.com/search?q={query.replace(' ', '+')}",
            "store": "Google Shopping",
            "platform": "google_shopping"
        }
    ]


async def scrape_ebay(query: str, max_price: int | None = None):
    """Mock eBay scraper"""
    # Return mock deals for now to test the flow
    return [
        {
            "title": f"eBay: {query} - Seller: BuyItNow",
            "price": 129.99,
            "url": f"https://www.ebay.com/sch/i.html?_nkw={query.replace(' ', '+')}",
            "store": "eBay",
            "platform": "ebay"
        },
        {
            "title": f"eBay: {query} - Auction",
            "price": 89.99,
            "url": f"https://www.ebay.com/sch/i.html?_nkw={query.replace(' ', '+')}",
            "store": "eBay",
            "platform": "ebay"
        }
    ]


async def save_deals_to_supabase(deals: list, hunt_id: str):
    """Save deals to Supabase"""
    if not deals:
        return []
    
    # Prepare data for Supabase - match found_items schema
    records = [
        {
            "hunt_id": hunt_id,
            "brand": "UPPAbaby",  # Default brand, should come from request
            "category": "Stroller",  # Default category, should come from request
            "title": deal["title"],
            "price": int(deal["price"]),
            "link": deal["url"],
            "image_url": None,
            "safety_status": "Unknown",
            "location": None,
            "found_at": datetime.utcnow().isoformat(),
            "is_viewed": False
        }
        for deal in deals
    ]
    
    try:
        result = supabase.table("found_items").insert(records).execute()
        print(f"✅ Saved {len(records)} deals to Supabase")
        return records
    except Exception as e:
        print(f"❌ Failed to save deals: {e}")
        return []


async def scrape_deals(query: str, hunt_id: str, max_price: int | None = None):
    """Main function to scrape both platforms and save results"""
    print(f"🔍 Starting scrape for: {query}")
    
    # Scrape both platforms concurrently
    google_deals, ebay_deals = await asyncio.gather(
        scrape_google_shopping(query, max_price),
        scrape_ebay(query, max_price)
    )
    
    all_deals = google_deals + ebay_deals
    
    # Sort by price (best deals first)
    all_deals.sort(key=lambda x: x["price"])
    
    # Save to Supabase
    saved_deals = await save_deals_to_supabase(all_deals, hunt_id)
    
    return saved_deals


# For testing locally
if __name__ == "__main__":
    test_deals = asyncio.run(scrape_deals(
        query="UPPAbaby Vista",
        hunt_id="test-hunt-123",
        max_price=500
    ))
    print(f"\n📊 Found {len(test_deals)} deals:")
    for deal in test_deals:
        print(f"  ${deal['price']} - {deal['title']} ({deal['store']})")
