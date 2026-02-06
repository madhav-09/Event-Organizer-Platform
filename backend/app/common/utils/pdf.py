from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black
from reportlab.lib.utils import ImageReader
from io import BytesIO
import qrcode
import json
from datetime import datetime


PRIMARY = HexColor("#2563eb")   # blue-600
DARK = HexColor("#111827")      # gray-900
GRAY = HexColor("#6b7280")      # gray-500
LIGHT = HexColor("#f9fafb")     # gray-50


def generate_ticket_pdf(ticket_info: dict) -> bytes:
    """
    Production-grade Event Ticket PDF with QR
    """

    # ---------- SAFE DATA ----------
    booking_id = ticket_info.get("booking_id", "N/A")
    event_id = ticket_info.get("event_id", "N/A")
    ticket_id = ticket_info.get("ticket_id", "N/A")
    event_name = ticket_info.get("event_name", "Event")
    venue = ticket_info.get("venue", "Venue TBA")
    user_name = ticket_info.get("user_name", "Attendee")
    ticket_title = ticket_info.get("ticket_title", "General Ticket")
    quantity = ticket_info.get("quantity", 1)

    event_date = ticket_info.get("event_date")
    event_time = ticket_info.get("event_time")

    if isinstance(event_date, datetime):
        event_date = event_date.strftime("%d %b %Y")
    if isinstance(event_time, datetime):
        event_time = event_time.strftime("%I:%M %p")

    event_date = event_date or "TBA"
    event_time = event_time or "TBA"

    issued_at = datetime.utcnow().isoformat()

    # ---------- PDF SETUP ----------
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # ---------- BACKGROUND CARD ----------
    margin = 15 * mm
    c.setFillColor(LIGHT)
    c.roundRect(
        margin,
        margin,
        width - 2 * margin,
        height - 2 * margin,
        12,
        fill=1,
        stroke=0,
    )

    # ---------- HEADER ----------
    c.setFillColor(PRIMARY)
    c.roundRect(
        margin,
        height - 55 * mm,
        width - 2 * margin,
        40 * mm,
        12,
        fill=1,
        stroke=0,
    )

    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Helvetica-Bold", 22)
    c.drawString(margin + 12 * mm, height - 38 * mm, "EVENT ENTRY PASS")

    c.setFont("Helvetica", 11)
    c.drawString(margin + 12 * mm, height - 46 * mm, "Swasthya Chetna")

    # ---------- EVENT INFO ----------
    y = height - 75 * mm
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin + 12 * mm, y, event_name)

    y -= 18
    c.setFont("Helvetica", 11)
    c.setFillColor(GRAY)
    c.drawString(margin + 12 * mm, y, f"📅 {event_date}")
    c.drawString(margin + 70 * mm, y, f"⏰ {event_time}")

    y -= 14
    c.drawString(margin + 12 * mm, y, f"📍 {venue}")

    # Divider
    y -= 14
    c.setStrokeColor(GRAY)
    c.line(
        margin + 12 * mm,
        y,
        width - margin - 12 * mm,
        y,
    )

    # ---------- ATTENDEE DETAILS ----------
    y -= 20
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(DARK)
    c.drawString(margin + 12 * mm, y, "Attendee")

    c.setFont("Helvetica", 11)
    y -= 16
    c.drawString(margin + 12 * mm, y, f"Name: {user_name}")
    y -= 14
    c.drawString(margin + 12 * mm, y, f"Ticket: {ticket_title}")
    y -= 14
    c.drawString(margin + 12 * mm, y, f"Quantity: {quantity}")
    y -= 14
    c.drawString(margin + 12 * mm, y, f"Booking ID: {booking_id}")

    # ---------- QR SECTION ----------
    qr_payload = {
        "v": 1,
        "booking_id": booking_id,
        "event_id": event_id,
        "ticket_id": ticket_id,
        "attendee": user_name,
        "qty": quantity,
        "issued_at": issued_at,
    }

    qr = qrcode.QRCode(box_size=6, border=2)
    qr.add_data(json.dumps(qr_payload))
    qr.make(fit=True)

    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)

    qr_reader = ImageReader(qr_buffer)

    qr_x = width - margin - 60 * mm
    qr_y = margin + 60 * mm

    # QR box
    c.setFillColor(HexColor("#ffffff"))
    c.roundRect(qr_x - 6 * mm, qr_y - 6 * mm, 60 * mm, 70 * mm, 10, fill=1, stroke=0)

    c.drawImage(
        qr_reader,
        qr_x,
        qr_y,
        width=48 * mm,
        height=48 * mm,
        mask="auto",
    )

    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(DARK)
    c.drawCentredString(qr_x + 24 * mm, qr_y - 10, "SCAN AT ENTRY")

    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY)
    c.drawCentredString(qr_x + 24 * mm, qr_y - 24, "Valid once • QR verified")

    # ---------- FOOTER ----------
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY)
    c.drawCentredString(
        width / 2,
        margin + 10,
        "Powered by Swasthya Chetna • Entry allowed only after QR verification",
    )

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()
