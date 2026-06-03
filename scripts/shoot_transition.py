import os
from playwright.sync_api import sync_playwright

OUT = "C:/Users/acer/Desktop/perfumes/.shots"
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(headless=False, args=["--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu", "--disable-features=CalculateNativeWinOcclusion"])
    pg = b.new_page(viewport={"width": 1600, "height": 900}, device_scale_factor=1)
    pg.goto("http://localhost:3000/?tier=high", wait_until="networkidle", timeout=60000)
    pg.wait_for_timeout(4500)
    # settle at station 1
    pg.evaluate("() => { const l = window.__lenis; const m = document.body.scrollHeight - window.innerHeight; l.scrollTo(Math.round(m*0.2), { immediate: true }); }")
    pg.wait_for_timeout(2300)
    # animate to station 2 — capture the dolly across ~1.8s
    pg.evaluate("() => { const l = window.__lenis; const m = document.body.scrollHeight - window.innerHeight; l.scrollTo(Math.round(m*0.4), { duration: 1.6 }); }")
    for i in range(6):
        pg.wait_for_timeout(300)
        pg.screenshot(path=f"{OUT}/t{i}.png")
        print("t", i)
    b.close()
