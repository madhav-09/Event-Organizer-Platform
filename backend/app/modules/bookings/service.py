from app.common.utils.email import send_email
from app.modules.tickets.service import create_ticket

def send_ticket_email(user_email, ticket_path):
    send_email(
        to=user_email,
        subject="Your Event Ticket 🎟️",
        body="Thank you for booking. Your ticket is attached.",
        attachment=ticket_path
    )



