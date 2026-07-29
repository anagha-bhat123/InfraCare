import re
from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.schemas.user import UpdateProfileRequest, UpdatePreferencesRequest

router = APIRouter(prefix="/profile", tags=["profile"])

# Regex for a valid UUID (v4 format)
_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)

def is_demo_user(user_id: str) -> bool:
    """
    Demo users have IDs like 'demo-citizen', 'demo-engineer', 'demo-admin'.
    These are not valid UUIDs and cannot be stored in the Supabase DB.
    Return True so callers can skip DB operations gracefully.
    """
    return not _UUID_RE.match(user_id.strip())


# ─────────────────────────────────────────────
#  GET /profile/{user_id}
#  Load saved profile + preferences for a user
# ─────────────────────────────────────────────
@router.get("/{user_id}")
def get_profile(user_id: str):
    if not supabase or is_demo_user(user_id):
        return {"profile": None, "preferences": None}

    try:
        profile_res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        profile = profile_res.data[0] if profile_res.data else None

        pref_res = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        preferences = pref_res.data[0] if pref_res.data else None

        return {"profile": profile, "preferences": preferences}
    except Exception as e:
        # Graceful degradation — table may not exist yet
        return {"profile": None, "preferences": None, "error": str(e)}


# ─────────────────────────────────────────────
#  PUT /profile/update
#  Save personal info (name, phone, ward, zone)
# ─────────────────────────────────────────────
@router.put("/update")
def update_profile(payload: UpdateProfileRequest):
    # Demo users (non-UUID IDs) cannot be stored in the DB
    if not supabase or is_demo_user(payload.user_id):
        return {"message": "Profile saved (demo mode — changes stored in session only)."}

    try:
        update_data = {
            "full_name": payload.full_name or None,
            "phone": payload.phone or None,
            "ward_zone": payload.ward_zone or None,
            "zone": payload.zone or None,
        }

        # Try to update; if no row exists for this user, insert it
        existing = supabase.table("profiles").select("id").eq("id", payload.user_id).execute()
        if existing.data:
            supabase.table("profiles").update(update_data).eq("id", payload.user_id).execute()
        else:
            insert_data = {**update_data, "id": payload.user_id}
            supabase.table("profiles").insert(insert_data).execute()

        return {"message": "Profile updated successfully."}
    except Exception as e:
        error_msg = str(e)
        
        # ── Fallback 1: Missing public.users row (Foreign Key Violation) ──
        if "23503" in error_msg or "foreign key" in error_msg.lower():
            try:
                # Automatically create the required public.users row
                dummy_email = f"migrated_{payload.user_id}@infracare.local"
                supabase.table("users").insert({
                    "id": payload.user_id,
                    "email": dummy_email,
                    "password_hash": "supabase_auth",
                    "role": "citizen"
                }).execute()
                
                # Retry profile insert
                insert_data = {
                    "id": payload.user_id,
                    "full_name": payload.full_name or None,
                    "phone": payload.phone or None,
                    "ward_zone": payload.ward_zone or None,
                    "zone": payload.zone or None,
                    "role": "citizen"
                }
                try:
                    supabase.table("profiles").insert(insert_data).execute()
                except Exception as e_inner:
                    inner_err = str(e_inner)
                    if "zone" in inner_err.lower() or "42703" in inner_err:
                        # Try again without 'zone'
                        insert_data.pop("zone", None)
                        supabase.table("profiles").insert(insert_data).execute()
                    else:
                        raise e_inner

                return {"message": "Profile updated successfully (recovered missing user row)."}
            except Exception as e2:
                raise HTTPException(status_code=500, detail=f"Profile update failed (FK recovery): {str(e2)}")

        # ── Fallback 2: Missing 'zone' column ──
        if "zone" in error_msg.lower() or "42703" in error_msg:
            try:
                fallback_data = {
                    "full_name": payload.full_name or None,
                    "phone": payload.phone or None,
                    "ward_zone": payload.ward_zone or None,
                }
                existing = supabase.table("profiles").select("id").eq("id", payload.user_id).execute()
                if existing.data:
                    supabase.table("profiles").update(fallback_data).eq("id", payload.user_id).execute()
                else:
                    supabase.table("profiles").insert({**fallback_data, "id": payload.user_id}).execute()
                return {"message": "Profile updated successfully (without zone field)."}
            except Exception as e3:
                raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e3)}")
                
        raise HTTPException(status_code=500, detail=f"Profile update failed: {error_msg}")


# ─────────────────────────────────────────────
#  PUT /profile/preferences
#  Save notification toggle settings
# ─────────────────────────────────────────────
@router.put("/preferences")
def update_preferences(payload: UpdatePreferencesRequest):
    # Demo users (non-UUID IDs) cannot be stored in the DB
    if not supabase or is_demo_user(payload.user_id):
        return {"message": "Preferences saved (demo mode — changes stored in session only)."}

    try:
        pref_data = {
            "user_id": payload.user_id,
            "email_alerts": payload.email_alerts,
            "sms_notifs": payload.sms_notifs,
            "hazard_alerts": payload.hazard_alerts,
            "repair_completion": payload.repair_completion,
        }

        # Upsert (insert or update) based on user_id primary key
        supabase.table("user_preferences").upsert(pref_data, on_conflict="user_id").execute()
        return {"message": "Preferences saved successfully."}
    except Exception as e:
        error_msg = str(e)
        # Table might not exist — surface a clear error
        if "does not exist" in error_msg.lower() or "42p01" in error_msg.lower():
            raise HTTPException(
                status_code=500,
                detail=(
                    "The 'user_preferences' table does not exist in your database. "
                    "Please run the SQL migration: CREATE TABLE user_preferences "
                    "(user_id TEXT PRIMARY KEY, email_alerts BOOLEAN DEFAULT TRUE, "
                    "sms_notifs BOOLEAN DEFAULT FALSE, hazard_alerts BOOLEAN DEFAULT TRUE, "
                    "repair_completion BOOLEAN DEFAULT TRUE, "
                    "updated_at TIMESTAMPTZ DEFAULT NOW());"
                ),
            )
        raise HTTPException(status_code=500, detail=f"Preferences update failed: {error_msg}")
