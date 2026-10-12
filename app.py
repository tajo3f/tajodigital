"""Entry point for Flask, Gunicorn and the existing Vercel deployment."""
import os
from backend.application import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1")
