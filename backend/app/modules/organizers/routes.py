from fastapi import APIRouter, Depends, HTTPException
from app.common.utils.dependencies import get_current_user
from app.core.database import db
from app.modules.organizers.models import Organizer
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/organizers", tags=["organizers"])


# ================= APPLY AS ORGANIZER =================
@router.post("/apply")
async def apply_organizer(
    data: Organizer,
    current_user=Depends(get_current_user(required_role="USER"))
):
    existing = await db.organizers.find_one({"user_id": current_user["_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")

    data.user_id = current_user["_id"]
    result = await db.organizers.insert_one(data.dict())
    return {
        "message": "Organizer application submitted",
        "organizer_id": str(result.inserted_id),
    }


# ================= ORGANIZER PROFILE =================
@router.get("/me")
async def get_organizer(
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    organizer = await db.organizers.find_one({"user_id": current_user["_id"]})
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer profile not found")
    return organizer


# ================= ORGANIZER EVENTS =================
@router.get("/me/events")
async def organizer_events(
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    events = []
    cursor = db.events.find({"organizer_id": current_user["_id"]})

    async for e in cursor:
        bookings_count = await db.bookings.count_documents(
            {"event_id": e["_id"], "status": "CONFIRMED"}
        )

        events.append({
            "event_id": str(e["_id"]),
            "title": e["title"],
            "date": e["start_date"],
            "location": e["city"],
            "status": e["status"],
            "total_bookings": bookings_count,
        })

    return events


# ================= ORGANIZER OVERVIEW =================
@router.get("/me/overview")
async def organizer_overview(
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    event_ids = await db.events.distinct(
        "_id", {"organizer_id": current_user["_id"]}
    )

    total_events = len(event_ids)

    total_registrations = await db.bookings.count_documents({
        "event_id": {"$in": event_ids},
        "status": "CONFIRMED",
    })

    revenue_cursor = db.bookings.aggregate([
        {
            "$match": {
                "event_id": {"$in": event_ids},
                "status": "CONFIRMED",
            }
        },
        {
            "$group": {
                "_id": None,
                "total": {"$sum": "$total_amount"},
            }
        },
    ])

    revenue_result = await revenue_cursor.to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    upcoming_events = await db.events.count_documents({
        "organizer_id": current_user["_id"],
        "start_date": {"$gte": datetime.utcnow()},
    })

    return {
        "total_events": total_events,
        "total_registrations": total_registrations,
        "total_revenue": total_revenue,
        "upcoming_events": upcoming_events,
    }
