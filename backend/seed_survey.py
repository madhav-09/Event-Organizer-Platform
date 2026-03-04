from app.core.database import db
from datetime import datetime
import asyncio

async def seed_data():
    organizer_email = "ajayjangir4368@gmail.com"
    user_email = "rahuljangir4368@gmail.com"
    
    # 1. Ensure organizer exists
    organizer = await db.users.find_one({"email": organizer_email, "role": "ORGANIZER"})
    if not organizer:
        print(f"Organizer {organizer_email} not found.")
        return
        
    # 2. Let's find an event to use
    event = await db.events.find_one({"organizer_id": organizer["_id"]})
    if not event:
        print("No events found for this organizer.")
        return
        
    print(f"Using event: {event['title']} (ID: {event['_id']})")
    
    # 3. Create a Booking for the static user so it shows up in past bookings
    user = await db.users.find_one({"email": user_email})
    if not user:
        print(f"User {user_email} not found.")
        return
        
    booking = {
        "booking_id": "TEST_BOOKING_123",
        "user_id": user["_id"],
        "event": {
            "id": str(event["_id"]),
            "title": event["title"],
            "date": "2020-01-01T12:00:00Z",  # force it into the past so "Leave Feedback" shows up
            "location": event.get("location", "Test Location"),
            "city": event.get("city", "Test City")
        },
        "ticket": { "id": "t1", "title": "Test Ticket", "price": 0 },
        "quantity": 1,
        "total_amount": 0,
        "status": "CONFIRMED",
        "created_at": datetime.utcnow()
    }
    await db.bookings.update_one(
        {"booking_id": "TEST_BOOKING_123"},
        {"$set": booking},
        upsert=True
    )
    print("Seeded historical booking.")
    
    print("Done")

if __name__ == "__main__":
    asyncio.run(seed_data())
