import sys, os
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000/"
OUT = sys.argv[2] if len(sys.argv) > 2 else "C:/Users/acer/Desktop/perfumes/.shots-ed"
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(headless=False, args=["--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu", "--disable-features=CalculateNativeWinOcclusion"])
    logs = []

    pg = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    pg.on("console", lambda m: logs.append(f"{m.type}: {m.text}"[:200]))
    pg.on("pageerror", lambda e: logs.append(f"PAGEERROR: {e}"[:200]))
    pg.goto(URL, wait_until="networkidle", timeout=60000)
    pg.wait_for_timeout(2500)
    pg.screenshot(path=f"{OUT}/d-hero.png")
    for i, frac in enumerate([0.1, 0.22, 0.4, 0.58, 0.74, 0.9]):
        pg.evaluate("(f)=>{const l=window.__lenis;const y=document.body.scrollHeight*f;if(l)l.scrollTo(y,{immediate:true});else window.scrollTo(0,y);}", frac)
        pg.wait_for_timeout(1500)
        pg.screenshot(path=f"{OUT}/d-{i}.png")
    pg.close()

    m = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    m.goto(URL, wait_until="networkidle", timeout=60000)
    m.wait_for_timeout(2000)
    m.screenshot(path=f"{OUT}/m-hero.png")
    m.evaluate("()=>{const y=document.body.scrollHeight*0.45;const l=window.__lenis;if(l)l.scrollTo(y,{immediate:true});else window.scrollTo(0,y);}")
    m.wait_for_timeout(1500)
    m.screenshot(path=f"{OUT}/m-mid.png")
    m.close()

    errs = [l for l in logs if "PAGEERROR" in l or "error:" in l.lower()]
    print("ERRORS:", errs[:12] if errs else "none")
    b.close()
