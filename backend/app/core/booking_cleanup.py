import asyncio
from datetime import datetime
from bson import ObjectId
from app.core.database import db


async def cleanup_expired_bookings():
    while True:
        expired_cursor = db.bookings.find({
            "status": "PENDING",
            "expires_at": {"$lt": datetime.utcnow()}
        })

        async for booking in expired_cursor:

            # restore ticket inventory
            await db.tickets.update_one(
                {"_id": ObjectId(booking["ticket_id"])},
                {"$inc": {"sold": -booking["quantity"]}}
            )

            # mark booking expired
            await db.bookings.update_one(
                {"_id": booking["_id"]},
                {"$set": {"status": "EXPIRED"}}
            )

        # run every minute
        await asyncio.sleep(60)