from app.common.utils.qr import generate_qr
from app.common.utils.pdf import generate_ticket_pdf

def create_ticket(booking):
    qr_data = f"BOOKING:{booking['_id']}"
    qr_buffer = generate_qr(qr_data)
    return generate_ticket_pdf(booking, qr_buffer)



