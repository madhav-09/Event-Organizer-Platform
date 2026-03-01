import os
from pathlib import Path
from typing import Optional
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv
import resend
import base64

load_dotenv()

# ================= RESEND CONFIG =================
resend.api_key = os.getenv("RESEND_API_KEY")

if not resend.api_key:
    raise ValueError("RESEND_API_KEY is not set in environment variables")

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
        template = env.get_template(template_name)
        html_content = template.render(**context)

        email_data = {
            "from": "onboarding@resend.dev",
            "to": to_email,
            "subject": subject,
            "html": html_content,
        }

        if pdf_bytes:
            encoded_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
            email_data["attachments"] = [
                {
                    "filename": pdf_filename,
                    "content": encoded_pdf,
                    "type": "application/pdf",
                }
            ]

        response = resend.Emails.send(email_data)

        print(f"Email sent to {to_email} successfully!")
        return response

    except Exception as e:
        print("Email sending failed:", e)