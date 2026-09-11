import re
from typing import Literal
from pydantic import BaseModel, field_validator, model_validator

EMAIL_RE   = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MOBILE_RE  = re.compile(r"^[6-9]\d{9}$")
ENG_ID_RE  = re.compile(r"^M-\d{3}-[A-Z0-9]{4}$", re.IGNORECASE)

SPECIAL_CHAR_RE = re.compile(r"[!@#$%^&*(),.?\":{}|<>_\-+=~`\[\]\\;/]")

def validate_strong_password(v: str) -> str:
    if not v:
        raise ValueError("Password is required.")
    v = v.strip() if isinstance(v, str) else str(v)
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter (A-Z).")
    if not re.search(r"[a-z]", v):
        raise ValueError("Password must contain at least one lowercase letter (a-z).")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one number (0-9).")
    if not SPECIAL_CHAR_RE.search(v):
        raise ValueError("Password must contain at least one special character (!@#$%^&* etc.).")
    return v

class LoginRequest(BaseModel):
    # IMPORTANT: role must be declared BEFORE identifier so that
    # Pydantic populates it in info.data by the time validate_identifier runs.
    role: Literal["citizen", "engineer", "admin", "approver"]
    identifier: str
    password: str

    @field_validator("identifier")
    @classmethod
    def validate_identifier(cls, v, info):
        v = v.strip()
        if not v:
            raise ValueError("Identifier is required.")
        role = info.data.get("role", "citizen")
        if role == "engineer":
            if not ENG_ID_RE.match(v) and not MOBILE_RE.match(v):
                raise ValueError("Enter your Employee ID (e.g. M-001-AB12) or registered 10-digit mobile number.")
        elif role == "admin":
            if not EMAIL_RE.match(v):
                raise ValueError("Enter a valid government email address.")
        elif role == "approver":
            if not EMAIL_RE.match(v) and not v.lower().startswith("approver") and not v.lower().startswith("fin-"):
                raise ValueError("Enter a valid approver email address or ID.")
        else:  # citizen
            if not EMAIL_RE.match(v) and not MOBILE_RE.match(v):
                raise ValueError("Enter a valid email address or 10-digit mobile number.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return validate_strong_password(v)

class RegisterEngineerRequest(BaseModel):
    full_name: str
    email: str
    mobile: str
    ward_zone: str = ""
    password: str = ""   # Engineer sets their own password; falls back to default if empty
    department: str = ""

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Full name is required.")
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters.")
        if not re.match(r"^[a-zA-Z\s]+$", v):
            raise ValueError("Full name can only contain letters and spaces (no numbers or special characters).")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        v = v.strip().lower()
        if not v:
            raise ValueError("Email is required.")
        if not EMAIL_RE.match(v):
            raise ValueError("Enter a valid email address.")
        return v

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Mobile number is required.")
        if not MOBILE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if v:
            return validate_strong_password(v)
        return v

class ChangePasswordRequest(BaseModel):
    identifier: str
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        return validate_strong_password(v)

class ForgotPasswordRequest(BaseModel):
    identifier: str

    @field_validator("identifier")
    @classmethod
    def validate_identifier(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Please enter your email, Employee ID, or mobile number.")
        return v

class ResetPasswordRequest(BaseModel):
    identifier: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        return validate_strong_password(v)


class UpdateProfileRequest(BaseModel):
    user_id: str
    full_name: str = ""
    phone: str = ""
    ward_zone: str = ""
    zone: str = ""

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v):
        v = v.strip()
        if v and not re.match(r"^[a-zA-Z\s]+$", v):
            raise ValueError("Full name can only contain letters and spaces (no numbers or special characters).")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        v = v.strip()
        if v and not MOBILE_RE.match(v):
            raise ValueError("Enter a valid 10-digit mobile number.")
        return v


class UpdatePreferencesRequest(BaseModel):
    user_id: str
    email_alerts: bool = True
    sms_notifs: bool = False
    hazard_alerts: bool = True
    repair_completion: bool = True

