import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    ALLOWED_ORIGIN: str = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")

    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "infracare-secret-change-in-production")
    JWT_ALGORITHM: str  = os.getenv("JWT_ALGORITHM", "HS256")

    # SMTP / Email settings
    SMTP_HOST: str     = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int     = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str     = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "").replace(" ", "")
    EMAIL_FROM: str    = os.getenv("EMAIL_FROM", "InfraCare <noreply@infracare.gov.in>")

settings = Settings()
