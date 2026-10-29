"""
backend/app/main.py
-------------------
FastAPI application entrypoint for the Network Traffic Protocol & Threat Classifier.
Includes CORS middleware for communication with the React + Vite frontend.
"""

import sys
import os

# Add project root and backend dir to sys.path so the module can run from any directory
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
for path in [PROJECT_ROOT, BACKEND_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.app.routes import router
except ImportError:
    from app.routes import router

app = FastAPI(
    title="Network Traffic Protocol & Threat Classifier API",
    description="Supervised ML API for NSL-KDD Threat Detection and Protocol Classification",
    version="1.0.0"
)

# Robust CORS configuration to allow any local frontend port/origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "Network Traffic Protocol & Threat Classifier API is running.",
        "documentation": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
