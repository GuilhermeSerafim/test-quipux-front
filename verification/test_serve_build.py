"""Local regression checks for the verification proxy; uses synthetic credentials only."""
import importlib.util
import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

spec = importlib.util.spec_from_file_location("serve_build", Path(__file__).with_name("serve-build.py"))
proxy_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(proxy_module)

class QuietHandler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

class Target(QuietHandler):
    received = []

    def do_GET(self):
        self.received.append({"method": self.command, "authorization_present": "Authorization" in self.headers})
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"[]")

    do_POST = do_GET
    do_DELETE = do_GET

class Upstream(QuietHandler):
    status = 301
    target_url = ""
    received = []

    def do_GET(self):
        self.rfile.read(int(self.headers.get("Content-Length", 0)))
        self.received.append({"method": self.command, "authorization_present": "Authorization" in self.headers})
        self.send_response(self.status)
        if 300 <= self.status < 400:
            self.send_header("Location", self.target_url)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b"[]")

    do_POST = do_GET
    do_DELETE = do_GET

class RedirectIsolationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.servers = []
        cls.threads = []
        cls.addClassCleanup(cls.stop_servers)
        # The actual helper uses this fixed loopback backend address.
        # If occupied, fail rather than interact with or stop another service.
        upstream = ThreadingHTTPServer(("127.0.0.1", 18080), Upstream)
        cls.servers.append(upstream)
        target = ThreadingHTTPServer(("127.0.0.1", 0), Target)
        cls.servers.append(target)
        proxy = ThreadingHTTPServer(("127.0.0.1", 0), proxy_module.Handler)
        cls.servers.append(proxy)
        Upstream.target_url = "http://127.0.0.1:" + str(target.server_port) + "/redirect-target"
        cls.proxy_url = "http://127.0.0.1:" + str(proxy.server_port) + "/lists"
        for server in cls.servers:
            thread = threading.Thread(target=server.serve_forever, kwargs={"poll_interval": 0.02})
            thread.start()
            cls.threads.append(thread)

    @classmethod
    def stop_servers(cls):
        for server, thread in zip(cls.servers, cls.threads):
            server.shutdown()
            thread.join(timeout=5)
        for server in cls.servers:
            server.server_close()

    def request(self, method):
        request = Request(self.proxy_url,
            data=b'{"synthetic":true}' if method == "POST" else None,
            headers={"Authorization": "Basic c3ludGhldGljOnRlc3Qtb25seQ==",
                     "Accept": "application/json", "Content-Type": "application/json"},
            method=method)
        try:
            result = urlopen(request, timeout=5)
        except HTTPError as error:
            result = error
        with result:
            return result.status, dict(result.headers), result.read()

    def test_redirects_never_reach_destination(self):
        for status in [301, 302, 303, 307, 308]:
            for method in ["GET", "POST", "DELETE"]:
                with self.subTest(status=status, method=method):
                    Upstream.status = status
                    Upstream.received.clear()
                    Target.received.clear()
                    actual_status, headers, body = self.request(method)
                    self.assertEqual(len(Upstream.received), 1)
                    self.assertTrue(Upstream.received[0]["authorization_present"])
                    self.assertEqual(Target.received, [], "Redirect destination received a request")
                    self.assertEqual(actual_status, 502)
                    self.assertNotIn("Location", headers)
                    self.assertIn(b"redirects are forbidden", body)

    def test_success_still_reaches_original_backend(self):
        Upstream.status = 200
        Upstream.received.clear()
        Target.received.clear()
        status, _, body = self.request("GET")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body), [])
        self.assertEqual(Upstream.received, [{"method": "GET", "authorization_present": True}])
        self.assertEqual(Target.received, [])

if __name__ == "__main__":
    unittest.main()
