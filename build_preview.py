"""Собирает одностраничную версию для превью в claude.ai: скрипты встраиваются в страницу.
Для Vercel и GitHub не нужен."""
import re, sys
from pathlib import Path
pub = Path(__file__).resolve().parent
html = (pub / "index.html").read_text(encoding="utf-8")
head = html.split("<head>", 1)[1].split("</head>", 1)[0]
body = html.split("<body>", 1)[1].split("</body>", 1)[0]
head = re.sub(r'<meta charset="utf-8">|<meta name="viewport"[^>]*>|<meta name="theme-color"[^>]*>|<meta name="description"[^>]*>|<style id="base-reset">.*?</style>', "", head, flags=re.S)
def inline(m):
    js = (pub / m.group(1)).read_text(encoding="utf-8")
    assert "</script" not in js.lower()
    return "<script>\n" + js + "\n</script>"
out = head.strip() + "\n" + re.sub(r'<script src="([\w.-]+)"></script>', inline, body)
Path(sys.argv[1] if len(sys.argv) > 1 else "preview.html").write_text(out, encoding="utf-8")
print("ok", len(out))
