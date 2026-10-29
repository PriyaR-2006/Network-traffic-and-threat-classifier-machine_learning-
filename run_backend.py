"""
run_backend.py
--------------
Convenient launcher for the FastAPI backend server.
Runs on http://127.0.0.1:8000 with CORS enabled.
"""

import sys
import os

# Ensure project root and backend dir are in sys.path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
for path in [PROJECT_ROOT, BACKEND_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

import uvicorn
from backend.app.main import app

if __name__ == "__main__":
    print("=" * 60)
    print("Starting Network Traffic Classifier API Backend...")
    print("API URL:        http://127.0.0.1:8000")
    print("Swagger Docs:   http://127.0.0.1:8000/docs")
    print("Health Check:   http://127.0.0.1:8000/api/health")
    print("Sample CSV:     http://127.0.0.1:8000/api/sample-csv")
    print("=" * 60)
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
