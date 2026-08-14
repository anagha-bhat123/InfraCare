from fastapi import APIRouter, HTTPException
import random
import string
from app.schemas.user import LoginRequest, ResetPasswordRequest, RegisterEngineerRequest, ChangePasswordRequest, ENG_ID_RE
from app.database import supabase
from app.utils.security import verify_password, get_password_hash
from app.utils.email import send_engineer_welcome_email

router = APIRouter(prefix="/auth", tags=["auth"])

# Demo credential store — replace with real DB lookup in production
DEMO_USERS = {
    "citizen":  {"identifiers": ["citizen@demo.com", "anaghabhat920@gmail.com", "9876543210"], "password": "123456"},
    "engineer": {"identifiers": ["M-001-PWD1", "m-001-pwd1", "M-002-MES1", "m-002-mes1", "M-001-AB12", "m-001-ab12", "M-002-8LUN", "m-002-8lun"], "password": "123456"},
    "admin":    {"identifiers": ["admin@infracare.gov.in"], "password": "12345678"},
    "approver": {"identifiers": ["approver@demo.com", "approver@infracare.gov.in", "fin-001-app"], "password": "approver123"},
}

# Specialized Engineer Department Metadata
SPECIFIC_ENGINEERS = {
    "m-001-pwd1": {
        "id": "eng-pwd-101",
        "name": "Er. Rajesh Sharma (PWD - Road & Drainage)",
        "email": "pwd.engineer@infracare.gov.in",
        "emp_id": "M-001-PWD1",
        "department": "PWD - Road & Drainage",
        "password": "pwd123",
    },
    "m-002-mes1": {
        "id": "eng-mes-102",
        "name": "Er. Vikram R. (MESCOM - Streetlight & Grid)",
        "email": "mescom.engineer@infracare.gov.in",
        "emp_id": "M-002-MES1",
        "department": "MESCOM - Streetlight & Grid",
        "password": "mescom123",
    },
    "m-001-ab12": {
        "id": "eng-1",
        "name": "Eng. Marcus Thorne (PWD Civil)",
        "email": "marcus.engineer@infracare.gov.in",
        "emp_id": "M-001-AB12",
        "department": "PWD - Road & Drainage",
        "password": "123456",
    },
    "m-002-8lun": {
        "id": "eng-2",
        "name": "Eng. Kavya Rao (MESCOM Electrical)",
        "email": "kavya.mescom@infracare.gov.in",
        "emp_id": "M-002-8LUN",
        "department": "MESCOM - Streetlight & Grid",
        "password": "123456",
    }
}

# Per-engineer credential store: maps emp_id.lower() -> bcrypt password_hash
ENGINEER_CREDS: dict = {}

def is_demo_credential(identifier: str) -> bool:
    v = identifier.strip().lower()
    return v in ["citizen@demo.com", "anaghabhat920@gmail.com", "9876543210", "m-001-pwd1", "m-002-mes1", "m-001-ab12", "m-002-8lun", "admin@infracare.gov.in", "approver@demo.com", "approver@infracare.gov.in", "fin-001-app"]

def generate_engineer_id(department: str = "") -> str:
    seq = "002" if department and "mescom" in department.lower() else "001"
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"M-{seq}-{chars}"

@router.get("/engineers")
def list_engineers():
    default_engineers = [
        {"id": "eng-1", "full_name": "Eng. Marcus Thorne", "emp_id": "M-001-AB12", "ward_zone": "Zone 4", "display": "Eng. Marcus Thorne (M-001-AB12)"},
        {"id": "eng-2", "full_name": "Eng. Kavya Rao", "emp_id": "M-002-CD34", "ward_zone": "Zone 2", "display": "Eng. Kavya Rao (M-002-CD34)"},
        {"id": "eng-3", "full_name": "Crew #14-B (Miller)", "emp_id": "M-014-B", "ward_zone": "Central Sector", "display": "Crew #14-B (Miller)"},
        {"id": "eng-4", "full_name": "Crew #12-A (Sharma)", "emp_id": "M-012-A", "ward_zone": "North Sector", "display": "Crew #12-A (Sharma)"},
        {"id": "eng-5", "full_name": "Crew #08-C (Patel)", "emp_id": "M-008-C", "ward_zone": "West Sector", "display": "Crew #08-C (Patel)"},
    ]
    if not supabase:
        return {"engineers": default_engineers}

    try:
        res = supabase.table("profiles").select("*").eq("role", "engineer").execute()
        db_engineers = res.data or []
        formatted = []
        for eng in db_engineers:
            name = eng.get("full_name") or eng.get("name") or "Engineer"
            emp = eng.get("emp_id") or ""
            display = f"{name} ({emp})" if emp else name
            formatted.append({
                "id": eng.get("id"),
                "full_name": name,
                "emp_id": emp,
                "ward_zone": eng.get("ward_zone"),
                "display": display
            })
        
        # Merge defaults so list is always complete
        existing_displays = set(e["display"] for e in formatted)
        for d in default_engineers:
            if d["display"] not in existing_displays:
                formatted.append(d)

        return {"engineers": formatted}
    except Exception as e:
        print(f"Failed to fetch engineers from DB: {e}")
        return {"engineers": default_engineers}

@router.post("/register-engineer")
def register_engineer(payload: RegisterEngineerRequest):
    emp_id = None
    if supabase:
        try:
            for _ in range(10):
                candidate = generate_engineer_id(payload.department)
                existing = supabase.table("profiles").select("id").eq("emp_id", candidate).execute()
                if not existing.data:
                    emp_id = candidate
                    break
        except Exception:
            pass
    
    if not emp_id:
        emp_id = generate_engineer_id(payload.department)
        
    default_password = payload.password.strip() if payload.password and payload.password.strip() else "123456"
    password_hash = get_password_hash(default_password)
    
    user_id = None
    if supabase:
        try:
            existing_user = supabase.table("users").select("id").eq("email", payload.email).execute()
            if existing_user.data:
                raise HTTPException(status_code=400, detail="An account with this email already exists.")
                
            user_data = {
                "email": payload.email,
                "password_hash": password_hash,
                "role": "engineer"
            }
            inserted_user = supabase.table("users").insert(user_data).execute()
            if not inserted_user.data:
                raise HTTPException(status_code=500, detail="Failed to create user in database.")
            user_id = inserted_user.data[0]["id"]
            
            profile_data = {
                "id": user_id,
                "full_name": payload.full_name,
                "role": "engineer",
                "phone": payload.mobile,
                "ward_zone": payload.ward_zone,
                "emp_id": emp_id,
                "must_change_password": True
            }
            try:
                supabase.table("profiles").insert(profile_data).execute()
            except Exception:
                # Fallback if emp_id / must_change_password columns do not exist yet
                fallback_profile = {
                    "id": user_id,
                    "full_name": payload.full_name,
                    "role": "engineer",
                    "phone": payload.mobile,
                    "ward_zone": payload.ward_zone,
                }
                supabase.table("profiles").insert(fallback_profile).execute()

            # Save to local credential memory so login works immediately
            if emp_id not in DEMO_USERS["engineer"]["identifiers"]:
                DEMO_USERS["engineer"]["identifiers"].append(emp_id)

        except Exception as e:
            if user_id:
                try:
                    supabase.table("users").delete().eq("id", user_id).execute()
                except:
                    pass
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Database error during registration: {str(e)}")
    else:
        if emp_id not in DEMO_USERS["engineer"]["identifiers"]:
            DEMO_USERS["engineer"]["identifiers"].append(emp_id)

    # Always store the individual password hash so fallback login works
    ENGINEER_CREDS[emp_id.lower()] = password_hash

    # ── Send welcome email SYNCHRONOUSLY so it always reaches the inbox ──────
    # This runs before returning the response — no daemon threads, no skipping.
    send_engineer_welcome_email(
        to_email=payload.email,
        full_name=payload.full_name,
        emp_id=emp_id,
        default_password=default_password,
    )

    return {
        "message": "Engineer registered successfully.",
        "engineer_id": emp_id,
        "default_password": default_password
    }

@router.post("/login")
def login(payload: LoginRequest):
    """Validate credentials and return user session data."""
    # Engineers cannot log in with email addresses
    if payload.role == "engineer" and "@" in payload.identifier:
        raise HTTPException(
            status_code=400,
            detail="Employees cannot log in using an email address. Use your Employee ID or registered mobile number."
        )
            
    if supabase and not is_demo_credential(payload.identifier):
        try:
            if payload.role == "engineer":
                identifier = payload.identifier.strip()
                # Look up by emp_id or by registered phone number
                if ENG_ID_RE.match(identifier):
                    profile_res = supabase.table("profiles").select("*").eq("emp_id", identifier).execute()
                    lookup_label = "Employee ID"
                else:
                    # mobile number lookup
                    profile_res = supabase.table("profiles").select("*").eq("phone", identifier).eq("role", "engineer").execute()
                    lookup_label = "mobile number"

                if not profile_res.data:
                    raise HTTPException(status_code=401, detail=f"No engineer account found with this {lookup_label}.")
                profile = profile_res.data[0]
                
                user_res = supabase.table("users").select("*").eq("id", profile["id"]).execute()
                if not user_res.data:
                    raise HTTPException(status_code=401, detail="User account not found.")
                user = user_res.data[0]
                
                if not verify_password(payload.password, user["password_hash"]):
                    raise HTTPException(status_code=401, detail="Incorrect password.")
                    
                role_home = {"citizen": "home", "engineer": "maintenance", "approver": "approval-authority", "admin": "map"}
                emp_id = profile.get("emp_id") or ""
                dept = "MESCOM - Streetlight & Grid" if (emp_id.upper().startswith("M-002") or "MES" in emp_id.upper()) else "PWD - Road & Drainage"
                return {
                    "user": {
                        "id": profile["id"],
                        "role": "engineer",
                        "name": profile["full_name"],
                        "email": user["email"],
                        "emp_id": emp_id,
                        "department": dept
                    },
                    "must_change_password": profile.get("must_change_password", True),
                    "redirect": role_home["engineer"]
                }
        except HTTPException as e:
            raise e
        except Exception as e:
            error_str = str(e)
            # If Supabase column doesn't exist yet (code 42703), fall through to
            # the in-memory DEMO_USERS store so engineers can still log in while
            # the database migration is pending.
            if "42703" in error_str or "does not exist" in error_str.lower():
                pass  # fall through to DEMO_USERS below
            else:
                raise HTTPException(status_code=500, detail=f"Database lookup failed: {error_str}")

    store = DEMO_USERS.get(payload.role, {})
    valid_identifiers = [i.lower() for i in store.get("identifiers", [])]

    if payload.identifier.lower() not in valid_identifiers:
        raise HTTPException(
            status_code=401,
            detail="Identifier not found. Check your credentials and selected role.",
        )

    role_home = {"citizen": "home", "engineer": "maintenance", "approver": "approval-authority", "admin": "dashboard"}

    # ── Engineer: verify against individual password hash or specific demo account
    if payload.role == "engineer":
        spec_key = payload.identifier.strip().lower()
        if spec_key in SPECIFIC_ENGINEERS:
            spec = SPECIFIC_ENGINEERS[spec_key]
            if payload.password != spec["password"] and payload.password != store.get("password", ""):
                raise HTTPException(status_code=401, detail="Incorrect password. Please enter valid password for your engineering department.")
            return {
                "user": {
                    "id": spec["id"],
                    "role": "engineer",
                    "name": spec["name"],
                    "email": spec["email"],
                    "emp_id": spec["emp_id"],
                    "department": spec["department"]
                },
                "must_change_password": False,
                "redirect": role_home["engineer"]
            }

        stored_hash = ENGINEER_CREDS.get(spec_key)
        if stored_hash:
            if not verify_password(payload.password, stored_hash):
                raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
        else:
            # Fallback: demo engineer with shared password
            if payload.password != store.get("password", ""):
                raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
    else:
        valid_password = store.get("password", "")
        if payload.password != valid_password:
            raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")

    must_change = False

    user_data = {
        "id":   f"demo-{payload.role}",
        "role": payload.role,
        "name": payload.identifier or payload.role.title(),
    }
    
    if payload.role == "engineer":
        emp_id = payload.identifier.strip().upper()
        matched_info = SPECIFIC_ENGINEERS.get(payload.identifier.strip().lower())
        if matched_info:
            user_data["name"] = matched_info["name"]
            user_data["email"] = matched_info["email"]
            user_data["emp_id"] = matched_info["emp_id"]
            user_data["department"] = matched_info["department"]
        else:
            dept = "MESCOM - Streetlight & Grid" if (emp_id.startswith("M-002") or "MES" in emp_id) else "PWD - Road & Drainage"
            user_data["emp_id"] = emp_id
            user_data["department"] = dept

    return {
        "user": user_data,
        "must_change_password": must_change,
        "redirect": role_home[payload.role],
    }

@router.post("/change-password")
def change_password(payload: ChangePasswordRequest):
    if supabase and not is_demo_credential(payload.identifier):
        try:
            identifier = payload.identifier.strip()
            # Allow lookup by emp_id or by mobile number
            if ENG_ID_RE.match(identifier):
                profile_res = supabase.table("profiles").select("*").eq("emp_id", identifier).execute()
            else:
                profile_res = supabase.table("profiles").select("*").eq("phone", identifier).eq("role", "engineer").execute()

            if not profile_res.data:
                raise HTTPException(status_code=404, detail="Engineer account not found.")
            profile = profile_res.data[0]
            
            user_res = supabase.table("users").select("*").eq("id", profile["id"]).execute()
            if not user_res.data:
                raise HTTPException(status_code=404, detail="User account not found.")
            user = user_res.data[0]
            
            if not verify_password(payload.old_password, user["password_hash"]):
                raise HTTPException(status_code=400, detail="Incorrect current password.")
                
            new_hash = get_password_hash(payload.new_password)
            supabase.table("users").update({"password_hash": new_hash}).eq("id", user["id"]).execute()
            
            supabase.table("profiles").update({"must_change_password": False}).eq("id", profile["id"]).execute()
            
            return {"message": "Password updated successfully."}
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")
            
    if is_demo_credential(payload.identifier):
        if payload.old_password == "123456":
            DEMO_USERS["engineer"]["password"] = payload.new_password
            return {"message": "Password updated successfully (demo)."}
        else:
            raise HTTPException(status_code=400, detail="Incorrect current password.")
            
    raise HTTPException(status_code=404, detail="User not found.")

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    identifier = payload.identifier.lower().strip()
    for role, data in DEMO_USERS.items():
        if identifier in [i.lower() for i in data["identifiers"]]:
            data["password"] = payload.new_password
            return {"message": "Password reset successfully"}
    
    raise HTTPException(
        status_code=404,
        detail="User not found with this identifier."
    )

