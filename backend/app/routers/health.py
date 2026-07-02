from fastapi import APIRouter
from app.database import supabase

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok", "supabase": bool(supabase)}
