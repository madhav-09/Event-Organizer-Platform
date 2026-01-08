import asyncio
from app.common.utils.email import send_email  # your fixed file

async def main():
    await send_email(
        to_email="rahuljangir4368@gmail.com",
        subject="Your Event Ticket",
        template_name="ticket_booking.html",
        context={"name": "Rahul", "event": "Music Concert", "date": "10 Jan 2026"}
    )

asyncio.run(main())
