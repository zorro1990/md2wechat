"""
Collect detailed console / network logs for the conversion worker.

Usage:
    python capture_worker_logs.py

The script will:
  1. Start the Vite dev server on 127.0.0.1:5173 (strict port).
  2. Launch Chromium via Playwright.
  3. Navigate to the app, wait for the editor to hydrate, and paste the long-article markdown.
  4. Record main-thread console, worker console, worker requests/responses, and final render metrics.
  5. Write the captured entries to apps/web/temp-worker-logs.json
"""

from __future__ import annotations

import json
import pathlib
import subprocess
import sys
import time
from contextlib import contextmanager
from typing import Any, Dict, List

from playwright.sync_api import ConsoleMessage, Request, Response, Worker, sync_playwright

REPO_ROOT = pathlib.Path(__file__).resolve().parents[3]
WEB_ROOT = REPO_ROOT / "apps/web"
OUTPUT_FILE = WEB_ROOT / "temp-worker-logs.json"

SERVER_CMD = ["npm", "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173", "--strictPort"]


def extract_long_article_markdown() -> str:
  fixtures_path = WEB_ROOT / "src/fixtures/test-cases.ts"
  content = fixtures_path.read_text(encoding="utf-8")
  marker = "id: 'long-article'"
  if marker not in content:
    raise RuntimeError("Could not find long-article fixture.")
  segment = content.split(marker, 1)[1]
  start = segment.index("markdown: `") + len("markdown: `")
  end = segment.index("`,\n  },", start)
  return segment[start:end]


@contextmanager
def ensure_dev_server():
  server = subprocess.Popen(SERVER_CMD, cwd=WEB_ROOT)
  try:
    time.sleep(3)
    yield
  finally:
    server.terminate()
    try:
      server.wait(timeout=5)
    except subprocess.TimeoutExpired:
      server.kill()


def main() -> None:
  markdown = extract_long_article_markdown()
  entries: List[Dict[str, Any]] = []

  def record(entry: Dict[str, Any]) -> None:
    entry["timestamp"] = time.time()
    entries.append(entry)

  with ensure_dev_server():
    with sync_playwright() as p:
      browser = p.chromium.launch()
      page = browser.new_page()

      def handle_console(msg: ConsoleMessage) -> None:
        record({"type": "console", "level": msg.type, "text": msg.text})

      def handle_request(request: Request) -> None:
        if "worker" in request.url:
          record({"type": "request", "url": request.url, "method": request.method})

      def handle_response(response: Response) -> None:
        if "worker" in response.url:
          record({"type": "response", "url": response.url, "status": response.status})

      def attach_worker(worker: Worker) -> None:
        record({"type": "worker-attached", "url": worker.url})

        def worker_console(msg: ConsoleMessage) -> None:
          record(
            {
              "type": "worker-console",
              "level": msg.type,
              "text": msg.text,
            },
          )

        worker.on("console", worker_console)
        worker.on("close", lambda: record({"type": "worker-close", "url": worker.url}))

        try:
          snapshot = worker.evaluate(
            "(() => { const hasDoc = typeof document !== 'undefined'; const docKeys = hasDoc ? Object.keys(document) : []; const hasCreate = hasDoc ? typeof document.createElement === 'function' : false; return { hasDocument: hasDoc, keys: docKeys, hasCreateElement: hasCreate }; })()",
          )
          record({"type": "worker-snapshot", "snapshot": snapshot})
        except Exception as exc:  # noqa: BLE001
          record({"type": "worker-eval-error", "message": str(exc)})

      page.on("console", handle_console)
      page.on("request", handle_request)
      page.on("response", handle_response)
      page.on("worker", attach_worker)

      record({"type": "info", "message": "navigating"})
      page.goto("http://127.0.0.1:5173", wait_until="networkidle")
      page.wait_for_selector('[data-testid="markdown-panel"][data-ready="true"]', timeout=10_000)
      record({"type": "info", "message": "editor ready"})

      page.wait_for_function(
        """() => {
          const el = document.querySelector('[data-testid="markdown-editor"]')
          return !!el && !el.disabled
        }""",
        timeout=60_000,
      )
      editor = page.locator('[data-testid="markdown-editor"]')
      editor.focus()
      page.evaluate(
        """(value) => {
          const textarea = document.querySelector('[data-testid="markdown-editor"]')
          if (!textarea) throw new Error('markdown editor textarea not found')
          textarea.value = value
          const event = new Event('input', { bubbles: true })
          textarea.dispatchEvent(event)
        }""",
        markdown,
      )

      page.wait_for_function("Array.isArray(window.__renderMetrics) && window.__renderMetrics.length > 0", timeout=120_000)
      metrics = page.evaluate("(window).__renderMetrics || []")
      record({"type": "metrics", "data": metrics})

      browser.close()

  OUTPUT_FILE.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")
  print(f"Captured logs to {OUTPUT_FILE}")


if __name__ == "__main__":
  try:
    main()
  except Exception as exc:  # noqa: BLE001
    print(f"[capture_worker_logs] failed: {exc}", file=sys.stderr)
    sys.exit(1)
