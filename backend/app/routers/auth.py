from fastapi import APIRouter, HTTPException
import random
import string
from app.schemas.user import LoginRequest, ResetPasswordRequest, ForgotPasswordRequest, RegisterEngineerRequest, ChangePasswordRequest, ENG_ID_RE, EMAIL_RE, MOBILE_RE
from app.database import supabase
from app.utils.security import verify_password, get_password_hash
from app.utils.email import send_engineer_welcome_email, send_password_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])

# Demo credential store — fallback store when DB migration or demo credentials are used
DEMO_USERS = {
    "citizen":  {"identifiers": ["citizen@demo.com", "anaghabhat920@gmail.com", "9876543210"], "passwords": ["Citizen@123", "123456"]},
    "engineer": {"identifiers": ["M-001-PWD1", "m-001-pwd1", "M-002-MES1", "m-002-mes1", "M-001-AB12", "m-001-ab12", "M-002-8LUN", "m-002-8lun"], "passwords": ["Engineer@123", "Pwd@1234", "Mescom@123", "123456"]},
    "admin":    {"identifiers": ["admin@infracare.gov.in"], "passwords": ["Admin@1234", "12345678"]},
    "approver": {"identifiers": ["approver@demo.com", "approver@infracare.gov.in", "fin-001-app"], "passwords": ["Approver@123", "approver123"]},
}

# Specialized Engineer Department Metadata
SPECIFIC_ENGINEERS = {
    "m-001-pwd1": {
        "id": "eng-pwd-101",
        "name": "Er. Rajesh Sharma (PWD - Road & Drainage)",
        "email": "pwd.engineer@infracare.gov.in",
        "emp_id": "M-001-PWD1",
        "department": "PWD - Road & Drainage",
        "passwords": ["Pwd@1234", "pwd123", "Engineer@123"],
    },
    "m-002-mes1": {
        "id": "eng-mes-102",
        "name": "Er. Vikram R. (MESCOM - Streetlight & Grid)",
        "email": "mescom.engineer@infracare.gov.in",
        "emp_id": "M-002-MES1",
        "department": "MESCOM - Streetlight & Grid",
        "passwords": ["Mescom@123", "mescom123", "Engineer@123"],
    },
    "m-001-ab12": {
        "id": "eng-1",
        "name": "Eng. Marcus Thorne (PWD Civil)",
        "email": "marcus.engineer@infracare.gov.in",
        "emp_id": "M-001-AB12",
        "department": "PWD - Road & Drainage",
        "passwords": ["Engineer@123", "123456"],
    },
    "m-002-8lun": {
        "id": "eng-2",
        "name": "Eng. Kavya Rao (MESCOM Electrical)",
        "email": "kavya.mescom@infracare.gov.in",
        "emp_id": "M-002-8LUN",
        "department": "MESCOM - Streetlight & Grid",
        "passwords": ["Engineer@123", "123456"],
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
            
            existing_phone = supabase.table("profiles").select("id").eq("phone", payload.mobile).execute()
            if existing_phone.data:
                raise HTTPException(status_code=400, detail="An account with this mobile number already exists.")
                
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
                DEMO_USERS["engineer"]["identifiers"].append(emp_id.lower())

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
            DEMO_USERS["engineer"]["identifiers"].append(emp_id.lower())

    # Store credentials locally as fallback
    ENGINEER_CREDS[emp_id.lower()] = password_hash
    SPECIFIC_ENGINEERS[emp_id.lower()] = {
        "id": user_id or f"eng-{emp_id}",
        "name": payload.full_name,
        "email": payload.email,
        "emp_id": emp_id,
        "department": payload.department or ("MESCOM - Streetlight & Grid" if "002" in emp_id else "PWD - Road & Drainage"),
        "passwords": [default_password]
    }

    # Send welcome email synchronously
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
    role_home = {"citizen": "home", "engineer": "maintenance", "approver": "approval-authority", "admin": "dashboard"}

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
                # Look up by emp_id (case-insensitive) or by registered phone number
                if ENG_ID_RE.match(identifier):
                    profile_res = supabase.table("profiles").select("*").eq("emp_id", identifier.upper()).execute()
                    if not profile_res.data:
                        profile_res = supabase.table("profiles").select("*").ilike("emp_id", identifier).execute()
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
            else:
                # Citizen / Admin / Approver database login
                identifier = payload.identifier.strip().lower()
                user_res = supabase.table("users").select("*").eq("email", identifier).execute()
                if not user_res.data and MOBILE_RE.match(identifier):
                    p_res = supabase.table("profiles").select("*").eq("phone", identifier).execute()
                    if p_res.data:
                        user_res = supabase.table("users").select("*").eq("id", p_res.data[0]["id"]).execute()
                
                if user_res.data:
                    db_user = user_res.data[0]
                    if not verify_password(payload.password, db_user["password_hash"]):
                        raise HTTPException(status_code=401, detail="Incorrect password.")
                    p_res = supabase.table("profiles").select("*").eq("id", db_user["id"]).execute()
                    db_profile = p_res.data[0] if p_res.data else {}
                    user_role = db_user.get("role") or db_profile.get("role") or payload.role
                    return {
                        "user": {
                            "id": db_user["id"],
                            "role": user_role,
                            "name": db_profile.get("full_name") or db_user.get("email") or payload.role.title(),
                            "email": db_user.get("email"),
                            "phone": db_profile.get("phone")
                        },
                        "must_change_password": db_profile.get("must_change_password", False),
                        "redirect": role_home.get(user_role, "home")
                    }
        except HTTPException as e:
            raise e
        except Exception as e:
            error_str = str(e)
            if "42703" in error_str or "does not exist" in error_str.lower():
                pass  # fall through to demo store
            else:
                raise HTTPException(status_code=500, detail=f"Database lookup failed: {error_str}")

    # Fallback store (Demo credentials)
    store = DEMO_USERS.get(payload.role, {})
    valid_identifiers = [i.lower() for i in store.get("identifiers", [])]

    # Include specific engineers in valid identifiers for engineer role
    if payload.role == "engineer":
        for spec_k in SPECIFIC_ENGINEERS.keys():
            if spec_k not in valid_identifiers:
                valid_identifiers.append(spec_k)

    if payload.identifier.lower() not in valid_identifiers:
        raise HTTPException(
            status_code=401,
            detail="Identifier not found. Check your credentials and selected role.",
        )

    # Engineer demo / local validation
    if payload.role == "engineer":
        spec_key = payload.identifier.strip().lower()
        if spec_key in SPECIFIC_ENGINEERS:
            spec = SPECIFIC_ENGINEERS[spec_key]
            allowed = spec.get("passwords", [])
            shared_allowed = store.get("passwords", [])
            stored_hash = ENGINEER_CREDS.get(spec_key)

            is_valid = False
            if stored_hash and verify_password(payload.password, stored_hash):
                is_valid = True
            elif payload.password in allowed or payload.password in shared_allowed:
                is_valid = True

            if not is_valid:
                raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")

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
            shared_allowed = store.get("passwords", [])
            if payload.password not in shared_allowed:
                raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
    else:
        valid_passwords = store.get("passwords", [])
        if payload.password not in valid_passwords:
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
        "redirect": role_home.get(payload.role, "home"),
    }

@router.post("/change-password")
def change_password(payload: ChangePasswordRequest):
    identifier = payload.identifier.strip()
    updated = False

    if supabase and not is_demo_credential(identifier):
        try:
            profile = None
            if ENG_ID_RE.match(identifier):
                profile_res = supabase.table("profiles").select("*").eq("emp_id", identifier.upper()).execute()
                if not profile_res.data:
                    profile_res = supabase.table("profiles").select("*").ilike("emp_id", identifier).execute()
                if profile_res.data:
                    profile = profile_res.data[0]
            elif MOBILE_RE.match(identifier):
                profile_res = supabase.table("profiles").select("*").eq("phone", identifier).execute()
                if profile_res.data:
                    profile = profile_res.data[0]
            elif EMAIL_RE.match(identifier):
                user_res = supabase.table("users").select("*").eq("email", identifier.lower()).execute()
                if user_res.data:
                    user_obj = user_res.data[0]
                    p_res = supabase.table("profiles").select("*").eq("id", user_obj["id"]).execute()
                    profile = p_res.data[0] if p_res.data else {"id": user_obj["id"]}

            if profile:
                user_res = supabase.table("users").select("*").eq("id", profile["id"]).execute()
                if user_res.data:
                    user = user_res.data[0]
                    if not verify_password(payload.old_password, user["password_hash"]):
                        raise HTTPException(status_code=400, detail="Incorrect current password.")
                    new_hash = get_password_hash(payload.new_password)
                    supabase.table("users").update({"password_hash": new_hash}).eq("id", user["id"]).execute()
                    try:
                        supabase.table("profiles").update({"must_change_password": False}).eq("id", profile["id"]).execute()
                    except Exception:
                        pass
                    if profile.get("emp_id"):
                        ENGINEER_CREDS[profile["emp_id"].lower()] = new_hash
                    return {"message": "Password updated successfully."}
        except HTTPException as e:
            raise e
        except Exception as e:
            print(f"Error in change_password database operation: {e}")

    ident_lower = identifier.lower()
    if ident_lower in SPECIFIC_ENGINEERS:
        spec = SPECIFIC_ENGINEERS[ident_lower]
        allowed = spec.get("passwords", [])
        stored_hash = ENGINEER_CREDS.get(ident_lower)
        is_valid = False
        if stored_hash and verify_password(payload.old_password, stored_hash):
            is_valid = True
        elif payload.old_password in allowed:
            is_valid = True

        if not is_valid:
            raise HTTPException(status_code=400, detail="Incorrect current password.")
        
        new_hash = get_password_hash(payload.new_password)
        spec["passwords"] = [payload.new_password]
        ENGINEER_CREDS[ident_lower] = new_hash
        return {"message": "Password updated successfully."}

    for role, data in DEMO_USERS.items():
        if ident_lower in [i.lower() for i in data.get("identifiers", [])]:
            allowed = data.get("passwords", [])
            if payload.old_password not in allowed:
                raise HTTPException(status_code=400, detail="Incorrect current password.")
            data["passwords"] = [payload.new_password]
            return {"message": "Password updated successfully."}

    raise HTTPException(status_code=404, detail="User not found with this identifier.")

def mask_email(email: str) -> str:
    if not email or "@" not in email:
        return email
    local, domain = email.split("@", 1)
    if len(local) <= 2:
        masked_local = local[0] + "*"
    else:
        masked_local = local[0] + "*" * (len(local) - 2) + local[-1]
    return f"{masked_local}@{domain}"

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    identifier = payload.identifier.strip()
    target_email = None
    full_name = "User"
    user_found = False
    
    # 1. Check if identifier is an Employee ID (e.g. M-002-VC96), Mobile, or Email in Supabase DB
    if supabase and not is_demo_credential(identifier):
        try:
            profile_res = None
            if ENG_ID_RE.match(identifier):
                profile_res = supabase.table("profiles").select("*").eq("emp_id", identifier.upper()).execute()
                if not profile_res.data:
                    profile_res = supabase.table("profiles").select("*").ilike("emp_id", identifier).execute()
            elif MOBILE_RE.match(identifier):
                profile_res = supabase.table("profiles").select("*").eq("phone", identifier).execute()
            elif EMAIL_RE.match(identifier):
                user_res = supabase.table("users").select("*").eq("email", identifier.lower()).execute()
                if user_res.data:
                    u = user_res.data[0]
                    target_email = u["email"]
                    p_res = supabase.table("profiles").select("full_name").eq("id", u["id"]).execute()
                    full_name = p_res.data[0]["full_name"] if p_res.data else "User"
                    user_found = True

            if profile_res and profile_res.data:
                prof = profile_res.data[0]
                full_name = prof.get("full_name") or "Engineer"
                u_res = supabase.table("users").select("email").eq("id", prof["id"]).execute()
                if u_res.data:
                    target_email = u_res.data[0]["email"]
                    user_found = True
        except Exception as e:
            print(f"Error looking up account for password reset: {e}")

    # 2. Check Specific Engineers or Demo Users
    if not user_found:
        ident_lower = identifier.lower()
        if ident_lower in SPECIFIC_ENGINEERS:
            spec = SPECIFIC_ENGINEERS[ident_lower]
            target_email = spec.get("email")
            full_name = spec.get("name")
            user_found = True
        else:
            for role, data in DEMO_USERS.items():
                if ident_lower in [i.lower() for i in data.get("identifiers", [])]:
                    target_email = data.get("identifiers")[0] if "@" in data.get("identifiers")[0] else f"{role}@demo.com"
                    full_name = role.title()
                    user_found = True
                    break

    if not user_found and not target_email:
        if EMAIL_RE.match(identifier):
            target_email = identifier.lower()
        else:
            raise HTTPException(
                status_code=404,
                detail=f"No account found with identifier '{identifier}'. Please verify your Employee ID, mobile number, or email address."
            )

    masked = mask_email(target_email)
    
    # Send email notification
    send_password_reset_email(
        to_email=target_email,
        full_name=full_name,
        identifier=identifier,
    )

    return {
        "success": True,
        "message": f"Password reset instructions have been sent to your registered email ({masked}).",
        "email": target_email,
        "masked_email": masked,
        "identifier": identifier
    }

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    identifier = payload.identifier.strip()
    new_hash = get_password_hash(payload.new_password)
    updated = False
    
    # Check DB lookup
    if supabase and not is_demo_credential(identifier):
        try:
            profile_res = None
            if ENG_ID_RE.match(identifier):
                profile_res = supabase.table("profiles").select("*").eq("emp_id", identifier.upper()).execute()
                if not profile_res.data:
                    profile_res = supabase.table("profiles").select("*").ilike("emp_id", identifier).execute()
            elif MOBILE_RE.match(identifier):
                profile_res = supabase.table("profiles").select("*").eq("phone", identifier).execute()
            elif EMAIL_RE.match(identifier):
                user_res = supabase.table("users").select("*").eq("email", identifier.lower()).execute()
                if user_res.data:
                    supabase.table("users").update({"password_hash": new_hash}).eq("id", user_res.data[0]["id"]).execute()
                    updated = True

            if profile_res and profile_res.data:
                prof = profile_res.data[0]
                supabase.table("users").update({"password_hash": new_hash}).eq("id", prof["id"]).execute()
                try:
                    supabase.table("profiles").update({"must_change_password": False}).eq("id", prof["id"]).execute()
                except Exception:
                    pass
                if prof.get("emp_id"):
                    ENGINEER_CREDS[prof["emp_id"].lower()] = new_hash
                updated = True
        except Exception as e:
            print(f"Error resetting DB password: {e}")

    # Check Demo & Specific Engineers
    ident_lower = identifier.lower()
    if ident_lower in SPECIFIC_ENGINEERS:
        SPECIFIC_ENGINEERS[ident_lower]["passwords"] = [payload.new_password]
        ENGINEER_CREDS[ident_lower] = new_hash
        updated = True
    else:
        for role, data in DEMO_USERS.items():
            if ident_lower in [i.lower() for i in data.get("identifiers", [])]:
                data["passwords"] = [payload.new_password]
                updated = True
                break

    if updated:
        return {"success": True, "message": "Password has been updated successfully. You can now log in with your new password."}

    raise HTTPException(status_code=404, detail="User not found with this identifier.")
