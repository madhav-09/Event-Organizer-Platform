from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.core.database import db
from app.common.utils.dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

def admin_only(user):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")

# Approve Organizer
@router.put("/organizers/{organizer_id}/approve")
async def approve_organizer(organizer_id: str, current_user=Depends(get_current_user())):
    admin_only(current_user)

    organizer = await db.organizers.find_one({"_id": ObjectId(organizer_id)})
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer not found")

    await db.organizers.update_one(
        {"_id": ObjectId(organizer_id)},
        {"$set": {"kyc_status": "APPROVED"}}
    )

    await db.users.update_one(
        {"_id": ObjectId(organizer["user_id"])},
        {"$set": {"role": "ORGANIZER"}}
    )

    return {"message": "Organizer approved"}





@router.put("/events/{event_id}/publish")
async def publish_event(event_id: str, current_user=Depends(get_current_user())):
    admin_only(current_user)

    await db.events.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": {"status": "PUBLISHED"}}
    )

    return {"message": "Event published"}




@router.get("/bookings")
async def all_bookings(current_user=Depends(get_current_user())):
    admin_only(current_user)

    cursor = db.bookings.find()
    bookings = []
    async for b in cursor:
        b["_id"] = str(b["_id"])
        bookings.append(b)

    return bookings



@router.get("/analytics/revenue")
async def revenue_analytics(current_user=Depends(get_current_user())):
    admin_only(current_user)

    pipeline = [
        {"$match": {"status": "CONFIRMED"}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}}}
    ]

    result = await db.bookings.aggregate(pipeline).to_list(length=1)
    return result[0] if result else {"total_revenue": 0}


@router.get("/analytics/events")
async def event_sales(current_user=Depends(get_current_user())):
    admin_only(current_user)

    pipeline = [
        {"$group": {
            "_id": "$event_id",
            "tickets_sold": {"$sum": "$quantity"},
            "revenue": {"$sum": "$total_amount"}
        }}
    ]

    return await db.bookings.aggregate(pipeline).to_list(None)


@router.get("/analytics/organizers")
async def organizer_stats(current_user=Depends(get_current_user())):
    admin_only(current_user)

    pipeline = [
        {"$lookup": {
            "from": "events",
            "localField": "event_id",
            "foreignField": "_id",
            "as": "event"
        }},
        {"$unwind": "$event"},
        {"$group": {
            "_id": "$event.organizer_id",
            "revenue": {"$sum": "$total_amount"}
        }}
    ]

    return await db.bookings.aggregate(pipeline).to_list(None)
