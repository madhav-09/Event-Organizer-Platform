from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from bson import ObjectId
from bson.errors import InvalidId

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
    limit: int = Query(10, le=50),
    skip: int = 0,
):
    query = {"status": status}

    if city:
        query["city"] = city
    if category:
        query["category"] = category

    cursor = db.events.find(query).skip(skip).limit(limit)
    events = []

    async for e in cursor:
        e["id"] = str(e["_id"])
        e["organizer_id"] = str(e["organizer_id"])
        del e["_id"]
        events.append(e)

    return events


# ================= GET SINGLE EVENT =================
@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: str):
    try:
        obj_id = ObjectId(event_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid event id")

    event = await db.events.find_one({"_id": obj_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event["id"] = str(event["_id"])
    event["organizer_id"] = str(event["organizer_id"])
    del event["_id"]

    return event
