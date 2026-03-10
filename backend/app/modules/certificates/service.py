"""
Certificate service: PDF generation, QR codes, Cloudinary upload.
Requires: pip install reportlab qrcode[pil]
"""
import io
import os
import asyncio
import logging
from typing import Optional
from datetime import datetime

from bson import ObjectId

import cloudinary
import cloudinary.uploader

logger = logging.getLogger(__name__)


ROLE_TO_TYPE = {
    "ATTENDEE": "Participation Certificate",
    "SPEAKER": "Speaker Certificate",
    "VOLUNTEER": "Volunteer Appreciation Certificate",
    "VENDOR": "Vendor Appreciation Certificate",
}


def _generate_pdf(
    name: str,
    event_name: str,
    event_date: str,
    role: str,
    cert_type: str,
    cert_id: str,
    frontend_base_url: str,
) -> bytes:
    """Generate a styled PDF certificate using reportlab."""
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import landscape, A4
    from reportlab.lib.colors import HexColor, white, black
    from reportlab.lib.units import cm
    import qrcode
    from PIL import Image

    width, height = landscape(A4)
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(width, height))

    # ─── Background ───────────────────────────────────────────
    c.setFillColor(HexColor("#0b0f1a"))
    c.rect(0, 0, width, height, fill=True, stroke=False)

    # Decorative gradient strip top
    c.setFillColor(HexColor("#6c47ec"))
    c.rect(0, height - 10, width, 10, fill=True, stroke=False)
    # Bottom strip
    c.rect(0, 0, width, 8, fill=True, stroke=False)

    # Side accents
    c.setFillColor(HexColor("#6c47ec"))
    c.setFillAlpha(0.25)
    c.ellipse(-80, height / 2 - 120, 80 + 80, height / 2 + 120, fill=True, stroke=False)
    c.ellipse(width - 80, height / 2 - 120, width + 80, height / 2 + 120, fill=True, stroke=False)

    # Reset alpha
    c.setFillAlpha(1.0)

    # ─── Border frame ───────────────────────────────────────
    c.setStrokeColor(HexColor("#6c47ec"))
    c.setLineWidth(2)
    c.rect(20, 20, width - 40, height - 40, fill=False, stroke=True)

    # Inner thin border
    c.setStrokeColor(HexColor("#4a348d"))
    c.setLineWidth(0.5)
    c.rect(28, 28, width - 56, height - 56, fill=False, stroke=True)

    # ─── Title badge ─────────────────────────────────────────
    badge_w, badge_h = 240, 34
    badge_x = (width - badge_w) / 2
    badge_y = height - 100
    c.setFillColor(HexColor("#6c47ec"))
    c.setFillAlpha(0.9)
    c.roundRect(badge_x, badge_y, badge_w, badge_h, 6, fill=True, stroke=False)
    c.setFillAlpha(1.0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(width / 2, badge_y + 11, cert_type.upper())

    # ─── Certificate heading ──────────────────────────────────
    c.setFillColor(HexColor("#e2d9f3"))
    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, height - 135, "THIS CERTIFICATE IS PROUDLY PRESENTED TO")

    # ─── Recipient name ───────────────────────────────────────
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 38)
    c.drawCentredString(width / 2, height - 195, name)

    # Underline under name
    name_width = c.stringWidth(name, "Helvetica-Bold", 38)
    c.setStrokeColor(HexColor("#6c47ec"))
    c.setLineWidth(1.5)
    underline_y = height - 202
    c.line((width - name_width) / 2, underline_y, (width + name_width) / 2, underline_y)

    # ─── Body text ────────────────────────────────────────────
    c.setFillColor(HexColor("#94a3b8"))
    c.setFont("Helvetica", 12)
    body = f"for their outstanding participation as a {role.capitalize()} at"
    c.drawCentredString(width / 2, height - 240, body)

    # ─── Event name ───────────────────────────────────────────
    c.setFillColor(HexColor("#c4b5fd"))
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 275, event_name)

    # ─── Date ─────────────────────────────────────────────────
    c.setFillColor(HexColor("#64748b"))
    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, height - 305, f"Held on  {event_date}")

    # ─── Divider ──────────────────────────────────────────────
    c.setStrokeColor(HexColor("#1e293b"))
    c.setLineWidth(1)
    c.line(60, height - 330, width - 60, height - 330)

    # ─── Signature placeholder ────────────────────────────────
    c.setFillColor(HexColor("#4a348d"))
    c.setFillAlpha(0.3)
    c.roundRect(width / 2 - 80, 65, 160, 46, 4, fill=True, stroke=False)
    c.setFillAlpha(1.0)
    c.setFillColor(HexColor("#94a3b8"))
    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(width / 2, 100, "Authorised Signature")
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(HexColor("#c4b5fd"))
    c.drawCentredString(width / 2, 82, "Event Organizer")

    # ─── QR Code ─────────────────────────────────────────────
    verify_url = f"{frontend_base_url}/verify-certificate/{cert_id}"
    qr = qrcode.QRCode(version=1, box_size=4, border=2)
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#6c47ec", back_color="#0b0f1a")

    qr_buf = io.BytesIO()
    qr_img.save(qr_buf, format="PNG")
    qr_buf.seek(0)
    from reportlab.lib.utils import ImageReader
    qr_reader = ImageReader(qr_buf)

    qr_size = 80
    c.drawImage(qr_reader, width - 130, 48, width=qr_size, height=qr_size)

    c.setFillColor(HexColor("#475569"))
    c.setFont("Helvetica", 7)
    c.drawCentredString(width - 90, 44, "Scan to verify")

    # ─── Cert ID watermark ────────────────────────────────────
    c.setFillColor(HexColor("#1e293b"))
    c.setFont("Helvetica", 7)
    c.drawString(42, 44, f"Certificate ID: {cert_id}")

    c.save()
    pdf_bytes = buf.getvalue()
    return pdf_bytes


def _upload_pdf_to_cloudinary(pdf_bytes: bytes, public_id: str) -> str:
    """
    Upload PDF bytes to Cloudinary.
    We use resource_type='raw' but append fl_attachment to make it a direct download.
    """
    result = cloudinary.uploader.upload(
        io.BytesIO(pdf_bytes),
        resource_type="raw",
        folder="certificates",
        public_id=public_id,
        format="pdf",
        # Allow direct access without auth
        access_mode="public",
    )
    # Return the secure_url — raw resources are always directly accessible
    return result["secure_url"]


async def generate_certificate_for_user(
    cert_id: str,
    name: str,
    email: str,
    event_name: str,
    event_date: str,
    role: str,
) -> str:
    """
    Generate a PDF certificate, upload to Cloudinary, return secure URL.
    Runs the CPU-bound PDF generation in a thread executor.
    """
    cert_type = ROLE_TO_TYPE.get(role.upper(), "Participation Certificate")
    frontend_base = os.getenv("FRONTEND_URL", "http://localhost:5173")

    loop = asyncio.get_event_loop()
    pdf_bytes = await loop.run_in_executor(
        None,
        _generate_pdf,
        name, event_name, event_date, role, cert_type, cert_id, frontend_base,
    )

    secure_url = await loop.run_in_executor(
        None,
        _upload_pdf_to_cloudinary,
        pdf_bytes,
        f"cert_{cert_id}",
    )
    return secure_url
