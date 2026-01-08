from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from io import BytesIO
import qrcode


def generate_ticket_pdf(ticket_info: dict) -> bytes:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 50, "Event Ticket")

    c.setFont("Helvetica", 14)
    c.drawString(50, height - 100, f"Name: {ticket_info['user_name']}")
    c.drawString(50, height - 140, f"Ticket: {ticket_info['ticket_title']}")
    c.drawString(50, height - 160, f"Quantity: {ticket_info['quantity']}")
    c.drawString(50, height - 180, f"Total Amount: ₹{ticket_info['total_amount']}")

    # ---------- QR CODE ----------
    qr_data = (
        f"BOOKING:{ticket_info.get('booking_id', '')}|"
        f"EVENT:{ticket_info.get('event_id', '')}|"
        f"USER:{ticket_info.get('user_name', '')}"
    )

    qr = qrcode.make(qr_data)
    qr_buffer = BytesIO()
    qr.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)

    qr_image = ImageReader(qr_buffer)

    c.drawImage(
        qr_image,
        width - 2.5 * inch,
        height - 3.5 * inch,
        width=2 * inch,
        height=2 * inch,
        mask="auto"
    )
    # ----------------------------

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()
