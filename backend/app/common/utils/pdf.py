from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def generate_ticket_pdf(booking, qr_buffer):
    file_path = f"tickets/{booking['_id']}.pdf"
    c = canvas.Canvas(file_path, pagesize=A4)

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, 800, "Event Ticket")

    c.setFont("Helvetica", 12)
    c.drawString(50, 760, f"Event ID: {booking['event_id']}")
    c.drawString(50, 740, f"User ID: {booking['user_id']}")
    c.drawString(50, 720, f"Quantity: {booking['quantity']}")

    c.drawImage(qr_buffer, 50, 500, width=150, height=150)

    c.save()
    return file_path
