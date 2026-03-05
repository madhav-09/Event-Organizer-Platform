from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from typing import List, Optional
from bson import ObjectId
from bson.errors import InvalidId
import logging

logger = logging.getLogger(__name__)

from app.common.utils.dependencies import get_current_user
from app.core.database import db
from app.modules.events.schemas import (
    EventCreate,
    EventUpdate,
    EventOut,
)
from app.modules.events.service import (
    create_event_service,
    update_event_service,
)

router = APIRouter(prefix="/events", tags=["events"])

EVENT_PUBLIC_PROJECTION = {
    "_id": 1,
    "organizer_id": 1,
    "title": 1,
    "description": 1,
    "category": 1,
    "tags": 1,
    "type": 1,
    "city": 1,
    "venue": 1,
    "start_date": 1,
    "end_date": 1,
    "banner_url": 1,
    "status": 1,
    "created_at": 1,
}


def _serialize_event(event: dict) -> dict:
    event["id"] = str(event.pop("_id"))
    event["organizer_id"] = str(event["organizer_id"])
    return event


# ================= CREATE EVENT =================
@router.post("/")
async def create_event(
    payload: EventCreate,
    current_user=Depends(get_current_user(required_role="ORGANIZER")),
):
    try:
        event_id = await create_event_service(payload, current_user["_id"])
        return {"event_id": event_id, "message": "Event created"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ================= UPDATE EVENT =================
@router.put("/{event_id}")
async def update_event(
    event_id: str,
    payload: EventUpdate,
    current_user=Depends(get_current_user(required_role="ORGANIZER")),
):
    try:
        obj_id = ObjectId(event_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid event id")

    try:
        matched = await update_event_service(obj_id, payload, current_user["_id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    if matched == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    return {"message": "Event updated"}


# ================= DELETE EVENT =================
@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    current_user=Depends(get_current_user(required_role="ORGANIZER")),
):
    try:
        obj_id = ObjectId(event_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid event id")

    result = await db.events.delete_one(
        {"_id": obj_id, "organizer_id": current_user["_id"]}
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    return {"message": "Event deleted"}


# ================= LIST EVENTS (PUBLIC) =================
@router.get("/", response_model=List[EventOut])
async def list_events(
    city: Optional[str] = None,
    category: Optional[str] = None,
    status: str = "PUBLISHED",
    limit: int = Query(10, ge=1, le=50),
    skip: int = Query(0, ge=0),
):
    query = {"status": status.strip().upper()}

    if city and city.strip():
        query["city"] = city.strip()
    if category and category.strip():
        query["category"] = category.strip()

    cursor = (
        db.events.find(query, EVENT_PUBLIC_PROJECTION)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    events = await cursor.to_list(length=limit)
    return [_serialize_event(event) for event in events]


# ================= GET SINGLE EVENT =================
@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: str):
    try:
        obj_id = ObjectId(event_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid event id")

    event = await db.events.find_one({"_id": obj_id}, EVENT_PUBLIC_PROJECTION)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return _serialize_event(event)
