import os
from pathlib import Path
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import aiosmtplib
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("EMAIL_USER")
SMTP_PASS = os.getenv("EMAIL_PASS")

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
    template = env.get_template(template_name)
    html_content = template.render(**context)

    msg = MIMEMultipart("mixed")
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(html_content, "html"))

    if pdf_bytes:
        pdf_part = MIMEApplication(pdf_bytes, _subtype="pdf")
        pdf_part.add_header(
            "Content-Disposition",
            f'attachment; filename="{pdf_filename}"'
        )
        msg.attach(pdf_part)

    await aiosmtplib.send(
        msg,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        start_tls=True,
        username=SMTP_USER,
        password=SMTP_PASS,
    )

    print(f"Email sent to {to_email} successfully!")
