#!/usr/bin/env python3
"""
serve.py — tiny static server for the house dossier preview.

Why not `python3 -m http.server`:
  * correct mime types for .js/.mjs/.svg/.woff2 (ES modules are rejected
    if the type is wrong, which leaves the page blank)
  * no directory-listing surprises: "/" always serves index.html
  * no caching, so a refresh always shows the newest drawings
  * binds 0.0.0.0 and never checks the Host header (preview proxy friendly)
  * logs the Host header, so a missing request is easy to spot

Usage:  python3 house/serve.py [port]
"""
import http.server
import socketserver
import sys
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5181

EXTRA_TYPES = {
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".svg": "image/svg+xml",
    ".json": "application/json; charset=utf-8",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("X-Frame-Options", "ALLOWALL")
        self.send_header("Content-Security-Policy", "frame-ancestors *")
        super().end_headers()

    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return EXTRA_TYPES.get(ext) or super().guess_type(path)

    def do_GET(self):
        # anything that is not a real file falls back to the dossier, so
        # /house/ or /anything still shows the page instead of a 404
        rel = self.path.split("?")[0].lstrip("/")
        target = os.path.join(ROOT, rel)
        if rel in ("", "/") or os.path.isdir(target):
            # the self-contained build is the most robust thing to show in a
            # preview iframe: no ES-module loading, no extra requests
            self.path = "/dhonashi-house.html" if os.path.exists(
                os.path.join(ROOT, "dhonashi-house.html")
            ) else "/index.html"
        elif not os.path.exists(target):
            self.path = "/index.html"
        host = self.headers.get("Host", "?")
        sys.stderr.write(f"[serve] host={host} path={self.path}\n")
        return super().do_GET()

    def log_message(self, fmt, *args):
        sys.stderr.write("[serve] " + (fmt % args) + "\n")


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Server(("0.0.0.0", PORT), Handler) as httpd:
        print(f"[serve] dossier on http://0.0.0.0:{PORT}/  (root: {ROOT})", flush=True)
        httpd.serve_forever()
