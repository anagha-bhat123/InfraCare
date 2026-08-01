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

def send_status_update_email(to_email: str, report_id: str, new_status: str, note: str = "") -> bool:
    print(f"[EMAIL] Preparing to send status update email for report {report_id} to {to_email}", flush=True)
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("[EMAIL] ERROR: SMTP credentials missing.", flush=True)
        return False

    subject = f"InfraCare: Update on your Report #{report_id}"
    text_body = f"Your report #{report_id} status has been updated to: {new_status}.\n\nNote: {note}\n\nThank you for using InfraCare."

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(text_body, "plain"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        print(f"[EMAIL] SUCCESS - status update sent to {to_email}", flush=True)
        return True
    except Exception as exc:
        print(f"[EMAIL] SEND FAILED to {to_email}: {exc}", flush=True)
        return False

def send_new_report_admin_notification(report_data: dict) -> bool:
    admin_email = getattr(settings, "ADMIN_EMAIL", "admin@infracare.gov.in")
    tracking_id = report_data.get("tracking_id", "CMP-NEW")
    title = report_data.get("title", "Infrastructure Defect")
    category = report_data.get("category", "Uncategorized")
    urgency = report_data.get("urgency", "Normal")
    description = report_data.get("description", "No description provided.")
    
    print(f"[EMAIL ALERT TO ADMIN] New Citizen Complaint Received: {tracking_id} - {title}", flush=True)
    
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("[EMAIL ALERT TO ADMIN] SMTP credentials missing, alert logged to console.", flush=True)
        return False

    subject = f"[ACTION REQUIRED] New Citizen Report Submitted: {tracking_id}"
    text_body = (
        f"Attention Admin,\n\n"
        f"A new civic damage complaint has been submitted by a citizen.\n\n"
        f"Complaint Tracking ID: {tracking_id}\n"
        f"Category:               {category}\n"
        f"Urgency Level:          {urgency}\n"
        f"Title:                  {title}\n"
        f"Description:            {description}\n\n"
        f"Please log in to the InfraCare Admin Command Portal to review the complaint, approve it, and assign an engineer.\n\n"
        f"— InfraCare Automated System Alert"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = admin_email
    msg.attach(MIMEText(text_body, "plain"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, admin_email, msg.as_string())
        print(f"[EMAIL ALERT TO ADMIN] SUCCESS - Notification sent to Admin ({admin_email})", flush=True)
        return True
    except Exception as exc:
        print(f"[EMAIL ALERT TO ADMIN] SEND FAILED to {admin_email}: {exc}", flush=True)
        return False

def send_engineer_task_assignment_email(engineer_name: str, report_id: str, title: str, category: str, note: str = "") -> bool:
    eng_email = "m-001-ab12@infracare.gov.in"
    print(f"[EMAIL ALERT TO ENGINEER] Task Assigned to {engineer_name}: Report #{report_id} - {title}", flush=True)

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("[EMAIL ALERT TO ENGINEER] SMTP credentials missing, alert logged to console.", flush=True)
        return False

    subject = f"[TASK DISPATCHED] New Assignment #{report_id} — {title}"
    text_body = (
        f"Dear {engineer_name},\n\n"
        f"Admin has assigned a new field task to your crew.\n\n"
        f"Task Ref ID: {report_id}\n"
        f"Category:    {category}\n"
        f"Title:       {title}\n"
        f"Admin Note:  {note}\n\n"
        f"Please log in to the Engineer Portal to view location coordinates, inspection details, and log your field repair updates.\n\n"
        f"— InfraCare Dispatch System"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = eng_email
    msg.attach(MIMEText(text_body, "plain"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, eng_email, msg.as_string())
        print(f"[EMAIL ALERT TO ENGINEER] SUCCESS - Notification sent to Engineer ({eng_email})", flush=True)
        return True
    except Exception as exc:
        print(f"[EMAIL ALERT TO ENGINEER] SEND FAILED: {exc}", flush=True)
        return False
