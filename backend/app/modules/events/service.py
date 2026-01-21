from datetime import datetime
from bson import ObjectId
from app.core.database import db
from app.modules.events.schemas import EventCreate, EventUpdate


async def create_event_service(payload: EventCreate, organizer_id: str):
    if payload.end_date < payload.start_date:
        raise ValueError("End date must be after start date")

    event = payload.dict()
    event["organizer_id"] = organizer_id
    event["created_at"] = datetime.utcnow()

    result = await db.events.insert_one(event)
    return str(result.inserted_id)


async def update_event_service(event_id: ObjectId, payload: EventUpdate, organizer_id: str):
    update_data = payload.dict(exclude_unset=True)

    if "start_date" in update_data and "end_date" in update_data:
        if update_data["end_date"] < update_data["start_date"]:
            raise ValueError("Invalid date range")

    result = await db.events.update_one(
        {"_id": event_id, "organizer_id": organizer_id},
        {"$set": update_data}
    )

    return result.matched_count
