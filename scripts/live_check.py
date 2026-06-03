import os, re, random
from playwright.sync_api import sync_playwright

OUT = "C:/Users/acer/Desktop/perfumes/.livecheck"
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(headless=False, args=["--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu", "--disable-features=CalculateNativeWinOcclusion"])
    ctx = b.new_context(viewport={"width": 1500, "height": 850})
    ctx.set_extra_http_headers({"Cache-Control": "no-cache", "Pragma": "no-cache"})
    pg = ctx.new_page()
    url = f"https://omarradwann.github.io/perfumes/?nocache={random.randint(1, 10**9)}"
    pg.goto(url, wait_until="networkidle", timeout=60000)
    html = pg.content()
    chunks = re.findall(r"_next/static/chunks/[\w\-~.]+\.js", html)
    # does the live page request the serif font (only new versions do)?
    has_font = "serif.json" in html or "fonts/serif" in html
    print("LIVE_CHUNKS", sorted(set(chunks))[:4])
    print("HAS_SERIF_FONT", has_font)
    pg.wait_for_timeout(5000)
    pg.screenshot(path=f"{OUT}/live.png")
    b.close()
print("OK")
