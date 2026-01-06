import smtplib
from email.message import EmailMessage
import os

def send_email(to, subject, body, attachment=None):
    msg = EmailMessage()
    msg["From"] = os.getenv("SMTP_EMAIL")
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    if attachment:
        with open(attachment, "rb") as f:
            msg.add_attachment(
                f.read(),
                maintype="application",
                subtype="pdf",
                filename="ticket.pdf"
            )

    server = smtplib.SMTP(
        os.getenv("SMTP_HOST"),
        int(os.getenv("SMTP_PORT"))
    )
    server.starttls()
    server.login(
        os.getenv("SMTP_EMAIL"),
        os.getenv("SMTP_PASSWORD")
    )
    server.send_message(msg)
    server.quit()
