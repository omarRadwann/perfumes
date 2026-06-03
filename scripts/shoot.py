import sys, os, json
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000/?tier=high"
OUT = sys.argv[2] if len(sys.argv) > 2 else "C:/Users/acer/Desktop/perfumes/.shots"
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=False,
        args=[
            "--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu",
            "--enable-unsafe-webgpu", "--disable-features=CalculateNativeWinOcclusion",
        ],
    )
    page = browser.new_page(viewport={"width": 1600, "height": 900}, device_scale_factor=1)
    logs = []
    page.on("console", lambda m: logs.append(f"{m.type}: {m.text}"[:300]))
    page.on("pageerror", lambda e: logs.append(f"PAGEERROR: {e}"[:300]))

    page.goto(URL, wait_until="networkidle", timeout=60000)
    gpu = page.evaluate(
        "() => { try { const c=document.createElement('canvas'); const gl=c.getContext('webgl2')||c.getContext('webgl'); const e=gl.getExtension('WEBGL_debug_renderer_info'); return e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):'no-ext'; } catch(err){ return 'err:'+err.message; } }"
    )
    print("GPU:", gpu)

    page.wait_for_timeout(4500)  # loader fade + intro push-in
    page.screenshot(path=f"{OUT}/00-intro.png")

    for i in range(6):
        page.evaluate(
            "(i) => { const l = window.__lenis; const t = Math.round((document.body.scrollHeight - window.innerHeight) * (i/5)); if (l && l.scrollTo) l.scrollTo(t, { immediate: true }); else window.scrollTo(0, t); }",
            i,
        )
        page.wait_for_timeout(2600)  # camera tween (1.3s) + arrival beat + settle
        page.screenshot(path=f"{OUT}/{i+1:02d}-station.png")
        print(f"shot station {i}")

    # close-up: station 2 framing then crop
    page.evaluate(
        "() => { const l = window.__lenis; const t = Math.round((document.body.scrollHeight - window.innerHeight) * (2/5)); if (l) l.scrollTo(t, { immediate: true }); }"
    )
    page.wait_for_timeout(2200)
    page.screenshot(path=f"{OUT}/07-closeup.png", clip={"x": 380, "y": 120, "width": 760, "height": 720})

    print("CONSOLE_TAIL:", json.dumps(logs[-25:]))
    browser.close()
