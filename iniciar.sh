#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"
[ -d .venv ] || python3 -m venv .venv
. .venv/bin/activate
python -c 'import flask, gunicorn' >/dev/null 2>&1 || python -m pip install -r requirements.txt
printf '%s\n' '[TAJO] Iniciando em http://127.0.0.1:5000'
python app.py
