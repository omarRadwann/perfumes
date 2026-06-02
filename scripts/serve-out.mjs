// Minimal dependency-free static server for the production export in out/.
// Used only for local verification: node scripts/serve-out.mjs  → http://localhost:4321
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "out");
const PORT = 4321;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain",
};

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent((req.url || "/").split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    let fp = normalize(join(root, p));
    if (!fp.startsWith(root)) {
      res.writeHead(403);
      return res.end("403");
    }
    try {
      const s = await stat(fp);
      if (s.isDirectory()) fp = join(fp, "index.html");
    } catch {
      /* fall through to read attempts */
    }
    let buf;
    try {
      buf = await readFile(fp);
    } catch {
      try {
        buf = await readFile(fp + ".html");
        fp += ".html";
      } catch {
        try {
          buf = await readFile(join(root, "404.html"));
        } catch {
          res.writeHead(404);
          return res.end("404");
        }
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(buf);
      }
    }
    res.writeHead(200, { "Content-Type": types[extname(fp)] || "application/octet-stream" });
    res.end(buf);
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
  }
});

server.listen(PORT, () => console.log(`serving out/ on http://localhost:${PORT}`));
