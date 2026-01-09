from fastapi import APIRouter, Depends, HTTPException
from app.common.utils.dependencies import get_current_user
from app.core.database import db
from app.modules.organizers.models import Organizer
from bson import ObjectId

router = APIRouter(prefix="/organizers", tags=["organizers"])

# Apply as organizer
@router.post("/apply")
async def apply_organizer(data: Organizer, current_user=Depends(get_current_user(required_role="USER"))):
    # Check if already organizer
    existing = await db.organizers.find_one({"user_id": current_user["_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")
    
    data.user_id = current_user["_id"]
    result = await db.organizers.insert_one(data.dict())
    return {"message": "Organizer application submitted", "organizer_id": str(result.inserted_id)}

# Get organizer profile
@router.get("/me")
async def get_organizer(current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    organizer = await db.organizers.find_one({"user_id": current_user["_id"]})
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer profile not found")
    return organizer



@router.get("/me/events")
async def organizer_events(user=Depends(get_current_user())):
    events = []
    cursor = db.events.find(
        {"organizer_id": ObjectId(user["_id"])}
    )

    async for e in cursor:
        bookings_count = await db.bookings.count_documents(
            {"event_id": e["_id"]}
        )

        events.append({
            "event_id": str(e["_id"]),
            "title": e["title"],
            "date": e["start_date"],
            "location": e["city"],
            # "price": e["price"],
            "status": e["status"],
            "total_bookings": bookings_count
        })

    return events
