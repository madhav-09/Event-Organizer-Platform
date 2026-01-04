from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.common.utils.dependencies import get_current_user
from app.core.database import db
from app.modules.events.models import Event
from bson import ObjectId

router = APIRouter(prefix="/events", tags=["events"])

# Create Event (Organizer only)
@router.post("/")
async def create_event(event: Event, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    event.organizer_id = current_user["_id"]
    result = await db.events.insert_one(event.dict())
    return {"message": "Event created", "event_id": str(result.inserted_id)}

# Update Event
@router.put("/{event_id}")
async def update_event(event_id: str, data: Event, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    existing = await db.events.find_one({"_id": ObjectId(event_id), "organizer_id": current_user["_id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": data.dict(exclude_unset=True)})
    return {"message": "Event updated"}

# Delete Event
@router.delete("/{event_id}")
async def delete_event(event_id: str, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    existing = await db.events.find_one({"_id": ObjectId(event_id), "organizer_id": current_user["_id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.events.delete_one({"_id": ObjectId(event_id)})
    return {"message": "Event deleted"}

# List Events (Public)
@router.get("/", response_model=List[Event])
async def list_events(city: str = None, category: str = None, date: str = None):
    query = {}
    if city:
        query["city"] = city
    if category:
        query["category"] = category
    if date:
        query["start_date"] = {"$lte": date}
    events_cursor = db.events.find(query)
    events = []
    async for e in events_cursor:
        e["_id"] = str(e["_id"])
        events.append(e)
    return events

# Get Event Details
@router.get("/{event_id}")
async def get_event(event_id: str):
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event["_id"] = str(event["_id"])
    return event
