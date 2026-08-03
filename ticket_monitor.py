import pandas as pd
import asyncio
import datetime
import os
from playwright.async_api import async_playwright

OUTPUT_DIR = "ticket_data"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

async def collect_data():
    all_items = []
    url = "https://www.stubhub.com/world-cup-east-rutherford-tickets-7-19-2026/event/153020449/"
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        async def handle_response(response):
            if "/event/153020449/" in response.url and "quantity=1" in response.url:
                try:
                    data = await response.json()
                    if "items" in data:
                        all_items.extend(data["items"])
                except:
                    pass
        page.on("response", handle_response)
        try:
            await page.goto(url)
            await page.wait_for_timeout(5000)
            try:
                await page.locator('button:has-text("1")').first.click(force=True)
                await page.get_by_role("button", name="Continue").click()
                await page.wait_for_timeout(3000)
            except:
                pass
            while True:
                show_more = page.get_by_role("button", name="Show more")
                if await show_more.is_visible():
                    try:
                        async with page.expect_response(lambda r: "/event/153020449/" in r.url) as resp:
                            await show_more.click(force=True, timeout=5000)
                        await resp.value
                        await page.wait_for_timeout(1000)
                    except:
                        break
                else:
                    break
        finally:
            await browser.close()
            
    if len(all_items) > 0:
        df = pd.json_normalize(all_items)
        df = df.drop_duplicates(subset=['id'])
        filename = f"tickets_{datetime.datetime.now().strftime('%Y%m%d_%H%M')}.csv"
        path = os.path.join(OUTPUT_DIR, filename)
        df.to_csv(path, index=False)
        print(f"[{datetime.datetime.now()}] success: {path} ({len(df)} rows)")
    else:
        print(f"[{datetime.datetime.now()}] fault")

async def main():
    print("starting")
    while True:
        try:
            await collect_data()
        except Exception as e:
            print(f"[{datetime.datetime.now()}] error: {e}")
        print("next hour")
        await asyncio.sleep(3600)

if __name__ == "__main__":
    asyncio.run(main())