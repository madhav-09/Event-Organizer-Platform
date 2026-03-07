import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from pathlib import Path
from typing import Optional
import traceback

import aiosmtplib
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv

load_dotenv()

# ================= SMTP CONFIG =================
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
SMTP_STARTTLS = os.getenv("SMTP_STARTTLS", "true").lower() in {"1", "true", "yes", "on"}
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "false").lower() in {"1", "true", "yes", "on"}
FROM_EMAIL = os.getenv("FROM_EMAIL") or EMAIL_USER

# ================= TEMPLATE CONFIG =================
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
TEMPLATES_DIR = BASE_DIR / "app" / "templates" / "email"

env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))


async def send_email(
    to_email: str,
    subject: str,
    template_name: str,
    context: dict,
    pdf_bytes: Optional[bytes] = None,
    pdf_filename: str = "ticket.pdf",
):
    try:
        if not EMAIL_USER or not EMAIL_PASS:
            raise RuntimeError("EMAIL_USER/EMAIL_PASS not configured")

        template = env.get_template(template_name)
        html_content = template.render(**context)

        # Build MIME message
        # Use "mixed" when there's an attachment, "alternative" for HTML-only
        msg = MIMEMultipart("mixed") if pdf_bytes else MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = FROM_EMAIL
        msg["To"] = to_email

        msg.attach(MIMEText(html_content, "html"))

        if pdf_bytes:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(pdf_bytes)
            encoders.encode_base64(part)
            part.add_header(
                "Content-Disposition",
                f'attachment; filename="{pdf_filename}"',
            )
            msg.attach(part)

        # TLS behavior:
        # - Gmail commonly uses STARTTLS on 587
        # - Implicit TLS (SMTPS) is commonly on 465
        use_tls = SMTP_USE_TLS or SMTP_PORT == 465
        start_tls = SMTP_STARTTLS if not use_tls else False

        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=EMAIL_USER,
            password=EMAIL_PASS,
            start_tls=start_tls,
            use_tls=use_tls,
        )

        print(f"Email sent to {to_email} successfully!")

    except Exception as e:
        print("Email sending failed:", repr(e))
        print(traceback.format_exc())
        raise