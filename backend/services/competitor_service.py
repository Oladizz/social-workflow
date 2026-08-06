import httpx
from bs4 import BeautifulSoup
import urllib.parse
from datetime import datetime
import asyncio
from pytrends.request import TrendReq
from playwright.async_api import async_playwright

class CompetitorService:
    @staticmethod
    async def analyze_shopify_store(store_url: str) -> dict:
        """
        Analyzes a Shopify store by fetching its public products.json endpoint.
        """
        if not store_url.startswith('http'):
            store_url = 'https://' + store_url
            
        parsed = urllib.parse.urlparse(store_url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        products_url = f"{base_url}/products.json?limit=250"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(products_url)
                if response.status_code != 200:
                    return {"error": f"Failed to fetch products. Status: {response.status_code}"}
                    
                data = response.json()
                products = data.get('products', [])
                
                if not products:
                    return {"error": "No products found or not a standard Shopify store."}
                
                prices = []
                top_products = []
                
                for idx, p in enumerate(products):
                    variants = p.get('variants', [])
                    if variants:
                        price = float(variants[0].get('price', 0))
                        prices.append(price)
                        
                        if idx < 6:
                            image = p.get('images', [{}])[0].get('src', '') if p.get('images') else ''
                            top_products.append({
                                'id': str(p.get('id')),
                                'title': p.get('title'),
                                'price': f"${price:.2f}",
                                'variants': len(variants),
                                'imageUrl': image
                            })
                
                if prices:
                    min_price = min(prices)
                    max_price = max(prices)
                    price_range = f"${min_price:.2f} - ${max_price:.2f}"
                else:
                    price_range = "Unknown"
                    
                store_name = parsed.netloc.replace('www.', '').split('.')[0].upper()
                
                return {
                    'id': str(hash(base_url)),
                    'url': base_url,
                    'name': store_name,
                    'productCount': len(products),
                    'priceRange': price_range,
                    'lastChecked': datetime.utcnow().isoformat(),
                    'topProducts': top_products
                }
                
        except Exception as e:
            return {"error": f"Scraping error: {str(e)}"}

    @staticmethod
    async def fetch_trending_products(category: str = None, query: str = None) -> list:
        """
        Uses pytrends to fetch trending dropshipping-related keywords.
        """
        try:
            # Run pytrends in a background thread because it's synchronous
            def get_trends():
                pytrend = TrendReq(hl='en-US', tz=360)
                kw_list = [query] if query else ["dropshipping products", "tiktok made me buy it", "trending gadgets"]
                pytrend.build_payload(kw_list=kw_list[:5], timeframe='today 3-m')
                # Get interest over time
                interest_over_time_df = pytrend.interest_over_time()
                
                results = []
                if not interest_over_time_df.empty:
                    for kw in kw_list:
                        if kw in interest_over_time_df.columns:
                            trend_values = interest_over_time_df[kw].tolist()
                            current_score = trend_values[-1]
                            previous_score = trend_values[-2] if len(trend_values) > 1 else 0
                            
                            direction = "stable"
                            if current_score > previous_score + 10: direction = "rising"
                            elif current_score < previous_score - 10: direction = "falling"
                            
                            results.append({
                                "id": kw.replace(" ", "-"),
                                "name": kw.title(),
                                "category": category or "Trending",
                                "trendScore": int(current_score),
                                "trendDirection": direction
                            })
                return results

            trends = await asyncio.to_thread(get_trends)
            return trends
        except Exception as e:
            return [{"error": f"PyTrends error: {str(e)}"}]

    @staticmethod
    async def search_meta_ads(query: str) -> list:
        """
        Uses Playwright to scrape Meta Ad Library.
        """
        try:
            results = []
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                # Navigate to ad library
                encoded_query = urllib.parse.quote(query)
                url = f"https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q={encoded_query}&search_type=keyword_unordered"
                
                await page.goto(url, wait_until="networkidle")
                
                # Wait for ad elements (this selector changes, we use a broad one)
                # Typically ads are loaded dynamically
                await page.wait_for_timeout(3000) 
                
                # Extract text content from the page as a rough heuristic since FB obfuscates classes
                ads = await page.locator("div[style*='border-radius: 8px']").all() # Rough guess of ad card container
                
                # Fallback extraction if no ads found by visual class
                if not ads:
                     content = await page.content()
                     # If blocked, handle it
                     if "login" in content.lower():
                          return [{"error": "Facebook blocked the scraper with a login wall. Try Option A."}]

                for i, ad in enumerate(ads[:6]): # Limit to 6
                    text = await ad.inner_text()
                    lines = text.split("\\n")
                    
                    results.append({
                        "id": f"ad_{i}",
                        "platform": "Facebook/Instagram",
                        "brand": lines[0] if lines else "Unknown",
                        "adCopy": " ".join(lines[1:4]) if len(lines) > 1 else "No text found",
                        "imageUrl": "", # Hard to extract reliably without full DOM parsing
                        "daysActive": 5
                    })
                    
                await browser.close()
                return results
                
        except Exception as e:
            return [{"error": f"Playwright error: {str(e)}"}]
