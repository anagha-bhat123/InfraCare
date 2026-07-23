import smtplib
import logging
import sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

# Use stdout handler so errors are visible in uvicorn console
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logger = logging.getLogger(__name__)


def send_engineer_welcome_email(
    to_email: str,
    full_name: str,
    emp_id: str,
    default_password: str = "123456",
) -> bool:
    """
    Send a welcome email to a newly registered engineer with their
    permanent Employee ID and default password.
    """
    print(f"[EMAIL] Preparing to send welcome email to: {to_email}", flush=True)
    print(f"[EMAIL] SMTP_HOST={settings.SMTP_HOST}  SMTP_PORT={settings.SMTP_PORT}", flush=True)
    print(f"[EMAIL] SMTP_USER={settings.SMTP_USER}  EMAIL_FROM={settings.EMAIL_FROM}", flush=True)

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("[EMAIL] ERROR: SMTP_USER or SMTP_PASSWORD is empty — cannot send email.", flush=True)
        return False

    subject = "Welcome to InfraCare — Your Employee Credentials"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }}
        .wrapper {{ max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px;
                    overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.1); }}
        .header {{ background: #111; color: #fff; padding: 28px 32px; }}
        .header h1 {{ margin: 0; font-size: 1.4rem; letter-spacing: .5px; }}
        .header p  {{ margin: 6px 0 0; opacity: .7; font-size: .9rem; }}
        .body {{ padding: 32px; color: #333; line-height: 1.7; }}
        .creds {{ background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
                  padding: 20px 24px; margin: 24px 0; }}
        .creds .label {{ font-size: .78rem; font-weight: 700; color: #888;
                          text-transform: uppercase; letter-spacing: .8px; margin-bottom: 4px; }}
        .creds .value {{ font-size: 1.35rem; font-weight: 800; color: #111;
                          font-family: 'Courier New', monospace; letter-spacing: 2px; }}
        .note {{ background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px;
                 padding: 14px 18px; font-size: .88rem; color: #92400e; margin-top: 20px; }}
        .footer {{ background: #f9fafb; padding: 18px 32px; font-size: .8rem; color: #999;
                   border-top: 1px solid #eee; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>&#127959; InfraCare — Employee Portal</h1>
          <p>Road Damage Detection &amp; Reporting System</p>
        </div>
        <div class="body">
          <p>Dear <strong>{full_name}</strong>,</p>
          <p>Welcome aboard! Your engineer account has been created successfully.
             Below are your permanent login credentials:</p>

          <div class="creds">
            <div class="label">Employee ID (permanent)</div>
            <div class="value">{emp_id}</div>
          </div>

          <div class="creds">
            <div class="label">Default Password</div>
            <div class="value" style="font-size:1.1rem;">{default_password}</div>
          </div>

          <div class="note">
            &#9888;&#65039; <strong>You will be asked to change this password on your first login.</strong>
            Please choose a strong, unique password and keep it confidential.
          </div>

          <p style="margin-top:24px;">
            To log in, visit the InfraCare portal and select <strong>Employee</strong> on the
            login page. Enter your <strong>Employee ID</strong> or your registered
            <strong>mobile number</strong> together with your password.
          </p>
        </div>
        <div class="footer">
          &copy; 2024 InfraCare Road Damage Detection &amp; Reporting System.
          This is an automated message — please do not reply.
        </div>
      </div>
    </body>
    </html>
    """

    text_body = (
        f"Dear {full_name},\n\n"
        f"Welcome to InfraCare! Your engineer account has been created.\n\n"
        f"Employee ID (permanent): {emp_id}\n"
        f"Default Password:        {default_password}\n\n"
        f"You will be prompted to change this password on your first login.\n\n"
        f"Log in at the InfraCare portal using your Employee ID or registered mobile number.\n\n"
        f"— InfraCare System"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = settings.EMAIL_FROM
    msg["To"]      = to_email
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        print(f"[EMAIL] Connecting to {settings.SMTP_HOST}:{settings.SMTP_PORT} ...", flush=True)
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            print(f"[EMAIL] Logging in as {settings.SMTP_USER} ...", flush=True)
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            print(f"[EMAIL] Sending to {to_email} ...", flush=True)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        print(f"[EMAIL] SUCCESS — email delivered to {to_email} (emp_id={emp_id})", flush=True)
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"[EMAIL] AUTHENTICATION FAILED: {e}", flush=True)
        logger.error("SMTP auth failed: %s", e)
        return False
    except Exception as exc:
        print(f"[EMAIL] SEND FAILED to {to_email}: {exc}", flush=True)
        logger.error("Failed to send welcome email to %s: %s", to_email, exc)
        return False
