import asyncio
from playwright.async_api import async_playwright
import re
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
    """Scrape Google Shopping for deals"""
    deals = []
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Google Shopping search
            url = f"https://www.google.com/search?tbm=shop&q={query.replace(' ', '+')}"
            await page.goto(url, wait_until="domcontentloaded")
            await page.wait_for_timeout(2000)
            
            # Extract product listings
            products = await page.query_selector_all("div[data-item-id]")
            
            for product in products[:5]:  # Limit to 5 results
                try:
                    title_elem = await product.query_selector("h3")
                    price_elem = await product.query_selector("span.a6T")
                    link_elem = await product.query_selector("a")
                    
                    if title_elem and price_elem and link_elem:
                        title = await title_elem.text_content()
                        price_text = await price_elem.text_content()
                        link = await link_elem.get_attribute("href")
                        
                        # Extract numeric price
                        price_match = re.search(r"\$?([\d,]+(?:\.\d{2})?)", price_text)
                        if price_match:
                            price = float(price_match.group(1).replace(",", ""))
                            
                            if max_price is None or price <= max_price:
                                deals.append({
                                    "title": title.strip(),
                                    "price": price,
                                    "url": link,
                                    "store": "Google Shopping",
                                    "platform": "google_shopping"
                                })
                except:
                    pass
            
            await browser.close()
    except Exception as e:
        print(f"❌ Google Shopping scrape error: {e}")
    
    return deals


async def scrape_ebay(query: str, max_price: int | None = None):
    """Scrape eBay for deals"""
    deals = []
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # eBay search
            url = f"https://www.ebay.com/sch/i.html?_nkw={query.replace(' ', '+')}"
            await page.goto(url, wait_until="domcontentloaded")
            await page.wait_for_timeout(2000)
            
            # Extract listings
            items = await page.query_selector_all("div.s-item")
            
            for item in items[:5]:  # Limit to 5 results
                try:
                    title_elem = await item.query_selector("h3 span")
                    price_elem = await item.query_selector("span.s-price")
                    link_elem = await item.query_selector("a.s-item__link")
                    
                    if title_elem and price_elem and link_elem:
                        title = await title_elem.text_content()
                        price_text = await price_elem.text_content()
                        link = await link_elem.get_attribute("href")
                        
                        # Extract numeric price
                        price_match = re.search(r"\$?([\d,]+(?:\.\d{2})?)", price_text)
                        if price_match:
                            price = float(price_match.group(1).replace(",", ""))
                            
                            if max_price is None or price <= max_price:
                                deals.append({
                                    "title": title.strip(),
                                    "price": price,
                                    "url": link,
                                    "store": "eBay",
                                    "platform": "ebay"
                                })
                except:
                    pass
            
            await browser.close()
    except Exception as e:
        print(f"❌ eBay scrape error: {e}")
    
    return deals


async def save_deals_to_supabase(deals: list, hunt_id: str):
    """Save deals to Supabase"""
    if not deals:
        return []
    
    # Prepare data for Supabase
    records = [
        {
            "hunt_id": hunt_id,
            "title": deal["title"],
            "price": deal["price"],
            "url": deal["url"],
            "store": deal["store"],
            "platform": deal["platform"],
            "found_at": datetime.utcnow().isoformat()
        }
        for deal in deals
    ]
    
    try:
        result = supabase.table("deals").insert(records).execute()
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
