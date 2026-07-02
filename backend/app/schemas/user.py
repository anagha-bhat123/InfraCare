import re
from typing import Literal
from pydantic import BaseModel, field_validator, model_validator

EMAIL_RE   = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MOBILE_RE  = re.compile(r"^[6-9]\d{9}$")
ENG_ID_RE  = re.compile(r"^M-\d{3}-[A-Z0-9]{4}$", re.IGNORECASE)

class LoginRequest(BaseModel):
    # IMPORTANT: role must be declared BEFORE identifier so that
    # Pydantic populates it in info.data by the time validate_identifier runs.
    role: Literal["citizen", "engineer", "admin"]
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
            if not ENG_ID_RE.match(v):
                raise ValueError("Invalid Employee ID format. Expected: M-000-XXXX.")
        elif role == "admin":
            if not EMAIL_RE.match(v):
                raise ValueError("Invalid government email address.")
        else:  # citizen
            if not EMAIL_RE.match(v) and not MOBILE_RE.match(v):
                raise ValueError("Enter a valid email address or 10-digit mobile number.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not v:
            raise ValueError("Password is required.")
        if not v.isdigit():
            raise ValueError("Password must contain numbers only.")
        if len(v) < 6 or len(v) > 8:
            raise ValueError("Password must be between 6 and 8 digits.")
        return v
