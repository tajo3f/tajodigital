from __future__ import annotations

import os
import re
import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, abort, jsonify, request, send_from_directory, redirect
from werkzeug.middleware.proxy_fix import ProxyFix

BASE_DIR = Path(__file__).resolve().parents[1]
PUBLIC_DIR = BASE_DIR / "public"
TEMPLATES_DIR = BASE_DIR / "templates"
DEFAULT_DATABASE_PATH = Path("/tmp/tajo-community.db") if os.getenv("VERCEL") else BASE_DIR / "data" / "community.db"
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", DEFAULT_DATABASE_PATH))
SITE_URL = os.getenv("SITE_URL", "https://tajodigital.com.br/").rstrip("/") + "/"
ADMIN_KEY = os.getenv("ADMIN_KEY", "")
MAX_MESSAGES = 1000
ONLINE_WINDOW_SECONDS = 45
MESSAGE_COOLDOWN_SECONDS = 7
SESSION_RE = re.compile(r"^[A-Za-z0-9_-]{8,100}$")

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)


def utc_iso(timestamp: int | float) -> str:
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat().replace("+00:00", "Z")


def get_db() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS presence (
                session_id TEXT PRIMARY KEY,
                last_seen INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON presence(last_seen);
            CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
            CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at);
            """
        )


def valid_session(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    value = value.strip()
    return value if SESSION_RE.fullmatch(value) else None


def normalize_text(value: object, max_len: int) -> str:
    if not isinstance(value, str):
        return ""
    value = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value)
    return value.strip()[:max_len]


def prune_presence(conn: sqlite3.Connection, now: int) -> int:
    cutoff = now - ONLINE_WINDOW_SECONDS
    conn.execute("DELETE FROM presence WHERE last_seen < ?", (cutoff - ONLINE_WINDOW_SECONDS * 4,))
    row = conn.execute("SELECT COUNT(*) AS total FROM presence WHERE last_seen >= ?", (cutoff,)).fetchone()
    return int(row["total"])


@app.after_request
def security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault("X-Permitted-Cross-Domain-Policies", "none")
    response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
    response.headers.setdefault("Cross-Origin-Resource-Policy", "same-origin")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if request.is_secure:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; "
        "media-src 'self'; object-src 'none'; connect-src 'self'; base-uri 'self'; form-action 'self' https://wa.me; frame-ancestors 'self'"
    )
    return response


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "site": "TAJO Digital", "site_url": SITE_URL})


@app.route("/api/presence", methods=["GET", "POST"])
def presence():
    now = int(time.time())
    with get_db() as conn:
        if request.method == "POST":
            payload = request.get_json(silent=True)
            if not isinstance(payload, dict):
                return jsonify({"error": "Envie um objeto JSON válido."}), 400
            session_id = valid_session(payload.get("session_id"))
            if not session_id:
                return jsonify({"error": "Sessão inválida."}), 400
            conn.execute(
                "INSERT INTO presence(session_id, last_seen) VALUES(?, ?) "
                "ON CONFLICT(session_id) DO UPDATE SET last_seen=excluded.last_seen",
                (session_id, now),
            )
        total = prune_presence(conn, now)
    return jsonify({"online": total, "window_seconds": ONLINE_WINDOW_SECONDS})


@app.get("/api/community/messages")
def get_messages():
    try:
        limit = max(1, min(int(request.args.get("limit", "50")), 100))
    except ValueError:
        limit = 50
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, session_id, name, message, created_at FROM messages ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    messages = [
        {
            "id": row["id"],
            "session_id": row["session_id"],
            "name": row["name"],
            "message": row["message"],
            "created_at": utc_iso(row["created_at"]),
        }
        for row in reversed(rows)
    ]
    return jsonify({"messages": messages})


@app.post("/api/community/messages")
def post_message():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Envie um objeto JSON válido."}), 400
    session_id = valid_session(payload.get("session_id"))
    name = normalize_text(payload.get("name"), 32)
    message = normalize_text(payload.get("message"), 280)

    if not session_id:
        return jsonify({"error": "Sessão inválida. Recarregue a página."}), 400
    if len(name) < 2:
        return jsonify({"error": "Informe um nome com pelo menos 2 caracteres."}), 400
    if len(message) < 2:
        return jsonify({"error": "Escreva uma mensagem com pelo menos 2 caracteres."}), 400

    now = int(time.time())
    with get_db() as conn:
        last = conn.execute(
            "SELECT created_at FROM messages WHERE session_id = ? ORDER BY id DESC LIMIT 1",
            (session_id,),
        ).fetchone()
        if last and now - int(last["created_at"]) < MESSAGE_COOLDOWN_SECONDS:
            wait = MESSAGE_COOLDOWN_SECONDS - (now - int(last["created_at"]))
            return jsonify({"error": f"Aguarde {wait}s antes de publicar outra mensagem."}), 429

        cursor = conn.execute(
            "INSERT INTO messages(session_id, name, message, created_at) VALUES(?, ?, ?, ?)",
            (session_id, name, message, now),
        )
        conn.execute(
            "DELETE FROM messages WHERE id NOT IN (SELECT id FROM messages ORDER BY id DESC LIMIT ?)",
            (MAX_MESSAGES,),
        )
        conn.execute(
            "INSERT INTO presence(session_id, last_seen) VALUES(?, ?) "
            "ON CONFLICT(session_id) DO UPDATE SET last_seen=excluded.last_seen",
            (session_id, now),
        )
        message_id = cursor.lastrowid

    return jsonify({"ok": True, "id": message_id, "created_at": utc_iso(now)}), 201


@app.delete("/api/community/messages/<int:message_id>")
def delete_message(message_id: int):
    if not ADMIN_KEY:
        return jsonify({"error": "Moderação remota não configurada."}), 503
    if request.headers.get("X-Admin-Key", "") != ADMIN_KEY:
        return jsonify({"error": "Não autorizado."}), 401
    with get_db() as conn:
        cursor = conn.execute("DELETE FROM messages WHERE id = ?", (message_id,))
    if cursor.rowcount == 0:
        return jsonify({"error": "Mensagem não encontrada."}), 404
    return jsonify({"ok": True})


@app.errorhandler(404)
def not_found(_error):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Recurso não encontrado."}), 404
    page = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Página não encontrada — TAJO Digital 3F</title>
<link rel="stylesheet" href="/assets/css/error.css">
</head>
<body>
  <main class="box">
    <p class="code">404</p>
    <h1>Não encontramos esta página.</h1>
    <p>O endereço pode ter mudado ou não existe mais. Volte para a página inicial para continuar navegando.</p>
    <a href="/">Voltar para o início</a>
  </main>
</body>
</html>"""
    return page, 404



PAGES = ("criacao-de-sites", "marketing-digital", "sistemas", "atendimento", "solucoes", "comunidade", "tajo-control", "radio")

@app.get("/")
def index():
    return send_from_directory(TEMPLATES_DIR, "index.html")

@app.get("/assets/<path:filename>")
def assets(filename):
    # send_from_directory uses safe_join; private source is never exposed.
    response = send_from_directory(PUBLIC_DIR / "assets", filename)
    response.headers["Cache-Control"] = "public, max-age=3600, must-revalidate"
    return response

@app.get("/<path:path>")
def public_page(path):
    if path in ("robots.txt", "sitemap.xml", "manifest.webmanifest"):
        return send_from_directory(PUBLIC_DIR, path)
    if path == "index.html":
        return redirect("/", code=301)
    if path == "solucoes.html":
        return redirect("/solucoes/", code=301)
    slug = path.rstrip("/")
    if slug in PAGES:
        if not path.endswith("/"):
            return redirect("/" + slug + "/", code=301)
        response = send_from_directory(TEMPLATES_DIR / "pages", slug + ".html")
        if slug == "comunidade":
            response.headers["X-Robots-Tag"] = "noindex, follow"
        return response
    if path in ("logo.png", "logo.webp", "founder.webp", "favicon.png", "apple-touch-icon.png", "icon-maskable-512.png", "og-image.png"):
        return redirect("/assets/images/" + path, code=301)
    if path.startswith("projects/"):
        name = path.split("/", 1)[1]
        folder = "video" if name.endswith(".mp4") else "projects"
        target = (PUBLIC_DIR / "assets" / folder / name).resolve()
        if target.is_relative_to((PUBLIC_DIR / "assets" / folder).resolve()) and target.is_file():
            return redirect("/assets/" + folder + "/" + name, code=301)
    abort(404)

init_db()
