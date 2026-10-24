"""
IPilot KG — сервер приложения.

Раздаёт интерфейс из корня проекта и передаёт запросы к ИИ в OpenRouter.
Ключ OpenRouter хранится только здесь (в .env), в браузер он не попадает.

Локальный запуск:  python server.py   (нужен только Python 3.9+, без установки пакетов)
На Vercel вместо этого файла работают функции из папки api/.
Открыть: http://localhost:8000
"""
import json
import os
import time
import urllib.error
import urllib.request
from collections import defaultdict, deque
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STATIC = ROOT


def load_env(path: Path) -> None:
    """Читает .env (строки KEY=VALUE) без сторонних библиотек."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env(ROOT / ".env")

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
MODEL = os.environ.get("OPENROUTER_MODEL", "openrouter/auto")
BASE = os.environ.get("OPENROUTER_BASE", "https://openrouter.ai/api/v1").rstrip("/")
PORT = int(os.environ.get("PORT", "8000"))
MAX_TOKENS = int(os.environ.get("MAX_TOKENS", "900"))
RATE_PER_MIN = int(os.environ.get("RATE_PER_MIN", "20"))

# Общие правила, которые сервер добавляет к каждому запросу
GUARD = (
    "Ты — IPilot KG, помощник индивидуальных предпринимателей Кыргызстана по налогам. "
    "Отвечай только по налогам, отчётности и сервису IPilot. Не придумывай ставки, сроки и номера ячеек: "
    "используй только данные из сообщения пользователя. Если не уверен — так и скажи и посоветуй позвонить в ГНС по номеру 116."
)

_hits = defaultdict(deque)


def rate_limited(ip: str) -> bool:
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > 60:
        q.popleft()
    if len(q) >= RATE_PER_MIN:
        return True
    q.append(now)
    return False


def call_openrouter(messages, want_json: bool) -> str:
    system = GUARD + (" Ответь только JSON, без пояснений и без markdown." if want_json else "")
    payload = {
        "model": MODEL,
        "messages": [{"role": "system", "content": system}] + messages,
        "max_tokens": MAX_TOKENS,
        "temperature": 0.2,
    }
    req = urllib.request.Request(
        BASE + "/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": "Bearer " + API_KEY,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ipilot.kg",
            "X-Title": "IPilot KG",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    choice = (data.get("choices") or [{}])[0]
    text = (choice.get("message") or {}).get("content") or ""
    if isinstance(text, list):  # некоторые модели отдают части
        text = "".join(part.get("text", "") for part in text if isinstance(part, dict))
    return text.strip()


def clean_messages(raw):
    """Пропускаем только user/assistant с текстом; ограничиваем размер."""
    if not isinstance(raw, list) or not raw:
        raise ValueError("messages: нужен непустой список")
    msgs = []
    total = 0
    for m in raw[-20:]:
        if not isinstance(m, dict) or m.get("role") not in ("user", "assistant"):
            continue
        content = str(m.get("content") or "")[:20000]
        if not content.strip():
            continue
        total += len(content)
        msgs.append({"role": m["role"], "content": content})
    if not msgs or msgs[-1]["role"] != "user":
        raise ValueError("последнее сообщение должно быть от пользователя")
    if total > 60000:
        raise ValueError("слишком длинный запрос")
    return msgs


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC), **kwargs)

    def log_message(self, fmt, *args):  # короче лог
        print("%s %s" % (self.address_string(), fmt % args))

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        if self.path.endswith((".js", ".html")) or self.path == "/":
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def _json(self, code: int, obj) -> None:
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path.startswith("/.") or path.endswith((".py", ".env")):
            return self._json(404, {"error": "not found"})
        if path == "/api/health":
            return self._json(200, {"ok": bool(API_KEY), "model": MODEL})
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0] != "/api/ai":
            return self._json(404, {"error": "not found"})
        if not API_KEY:
            return self._json(503, {"error": "Не задан OPENROUTER_API_KEY в .env"})
        ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
        if rate_limited(ip):
            return self._json(429, {"error": "Слишком много запросов, подождите минуту"})
        try:
            length = int(self.headers.get("Content-Length") or 0)
            if length > 200_000:
                raise ValueError("слишком большой запрос")
            body = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            msgs = clean_messages(body.get("messages"))
        except (ValueError, json.JSONDecodeError) as e:
            return self._json(400, {"error": str(e)})
        try:
            text = call_openrouter(msgs, bool(body.get("json")))
            return self._json(200, {"text": text})
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:300]
            print("OpenRouter HTTP", e.code, detail)
            return self._json(502 if e.code != 429 else 429, {"error": "Ошибка ИИ-сервиса (%s)" % e.code})
        except Exception as e:  # сеть, таймаут
            print("OpenRouter error:", repr(e))
            return self._json(502, {"error": "ИИ-сервис недоступен"})


if __name__ == "__main__":
    if not API_KEY:
        print("ВНИМАНИЕ: OPENROUTER_API_KEY не задан — ИИ будет выключен, остальное работает.")
    print("IPilot KG: http://localhost:%d  (модель: %s)" % (PORT, MODEL))
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
