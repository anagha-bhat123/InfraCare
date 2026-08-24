import os
import sys

# Bootstrap Python path to support running from any directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.routers import health, auth, reports, assignments, profile, inspections, budget_approvals

app = FastAPI(title="InfraCare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API routers (must be registered BEFORE static file mount) ──────────────
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(assignments.router)
app.include_router(profile.router)
app.include_router(inspections.router)
app.include_router(budget_approvals.router)

# ── Serve built React frontend ─────────────────────────────────────────────
_static_dir = os.path.join(parent_dir, "static")

if os.path.isdir(_static_dir):
    # Serve static assets (JS, CSS, images, …)
    app.mount("/assets", StaticFiles(directory=os.path.join(_static_dir, "assets")), name="assets")

    # Catch-all: return index.html so React Router handles client-side routes
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        index = os.path.join(_static_dir, "index.html")
        return FileResponse(index)
