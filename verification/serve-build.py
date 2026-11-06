"""Serve the production build and a loopback-only API proxy for local verification."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.request import Request, HTTPRedirectHandler, build_opener
from urllib.error import HTTPError, URLError

BUILD = Path(__file__).resolve().parents[1] / "build"

class RejectRedirects(HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        # Never send Authorization (or the request itself) to a redirect target.
        return None

API_OPENER = build_opener(RejectRedirects())

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BUILD), **kwargs)

    def log_message(self, *args):
        pass

    def proxy(self):
        size = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(size) if size else None
        headers = {key: self.headers[key] for key in ["Authorization", "Content-Type", "Accept"] if key in self.headers}
        request = Request("http://127.0.0.1:18080" + self.path, data=body, headers=headers, method=self.command)
        try:
            result = API_OPENER.open(request, timeout=20)
        except HTTPError as error:
            result = error
        except URLError:
            self.send_error(502, "Local validation backend unavailable")
            return
        if 300 <= result.status < 400:
            result.close()
            self.send_error(502, "Local validation backend redirects are forbidden")
            return
        payload = result.read()
        self.send_response(result.status)
        self.send_header("Content-Type", result.headers.get("Content-Type", "application/json"))
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)
        # No Authorization value, request body or password is logged.
        print(self.command, self.path, result.status, flush=True)

    def do_GET(self):
        if self.path.startswith("/lists"):
            return self.proxy()
        if not (BUILD / self.path.split("?", 1)[0].lstrip("/")).is_file():
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self):
        self.proxy()

    def do_DELETE(self):
        self.proxy()

if __name__ == "__main__":
    if not (BUILD / "index.html").is_file():
        raise SystemExit("Run npm run build first.")
    print("Local build: http://127.0.0.1:13000; API proxy: 127.0.0.1:18080", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 13000), Handler).serve_forever()
