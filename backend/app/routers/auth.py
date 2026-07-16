from fastapi import APIRouter, HTTPException
from app.schemas.user import LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])

# Demo credential store — replace with real DB lookup in production
DEMO_USERS = {
    "citizen":  {"identifiers": ["citizen@demo.com", "9876543210"], "password": "123456"},
    "engineer": {"identifiers": ["M-001-AB12"],                     "password": "123456"},
    "admin":    {"identifiers": ["admin@infracare.gov.in"],         "password": "12345678"},
}

@router.post("/login")
def login(payload: LoginRequest):
    """Validate demo credentials and return user session data."""
    store = DEMO_USERS.get(payload.role, {})
    valid_identifiers = [i.lower() for i in store.get("identifiers", [])]
    valid_password    = store.get("password", "")

    # Check identifier
    if payload.identifier.lower() not in valid_identifiers:
        raise HTTPException(
            status_code=401,
            detail="Identifier not found. Check your credentials and selected role.",
        )

    # Check password
    if payload.password != valid_password:
        raise HTTPException(
            status_code=401,
            detail="Incorrect password. Please try again.",
        )

    role_home = {"citizen": "track", "engineer": "maintenance", "admin": "map"}
    return {
        "user": {
            "id":   f"demo-{payload.role}",
            "role": payload.role,
            "name": payload.identifier or payload.role.title(),
        },
        "redirect": role_home[payload.role],
    }
