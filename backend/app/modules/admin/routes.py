from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.core.database import db
from app.common.utils.dependencies import get_current_user
from app.modules.users.models import User
from app.common.utils.security import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])

def admin_only(user):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")


@router.get("/organizers")
async def get_organizers(
    admin=Depends(get_current_user("ADMIN"))
):
    pipeline = [
        {"$match": {"kyc_status": "PENDING"}},
        {
            "$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user"
            }
        },
        {"$unwind": "$user"}
    ]

    results = await db.organizers.aggregate(pipeline).to_list(None)

    for r in results:
        r["_id"] = str(r["_id"])
        r["user_id"] = str(r["user_id"])
        r["user"]["_id"] = str(r["user"]["_id"])

    return results


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

@router.put("/organizers/{organizer_id}/reject")
async def reject_organizer(
    organizer_id: str,
    current_user=Depends(get_current_user())
):
    admin_only(current_user)

    organizer = await db.organizers.find_one(
        {"_id": ObjectId(organizer_id)}
    )
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer not found")

    await db.organizers.update_one(
        {"_id": ObjectId(organizer_id)},
        {"$set": {"kyc_status": "REJECTED"}}
    )

    return {"message": "Organizer rejected"}



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
    admin_only(current_user)  # Ensure only admins can access

    cursor = db.bookings.find()
    bookings = []
    async for b in cursor:
        # Convert all ObjectId fields to string
        b["_id"] = str(b["_id"])
        if "user_id" in b:
            b["user_id"] = str(b["user_id"])
        if "event_id" in b:
            b["event_id"] = str(b["event_id"])
        if "ticket_id" in b:
            b["ticket_id"] = str(b["ticket_id"])

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


@router.get("/users")
async def get_users(current_user=Depends(get_current_user("ADMIN"))):
    """
    Get all users with their organizer details (if any)
    """
    users_cursor = db.users.find({})
    users_list = await users_cursor.to_list(None)

    result = []
    for user in users_list:
        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        
        # Find organizer details for this user (if exists)
        organizer = await db.organizers.find_one({"user_id": ObjectId(user["_id"])})
        if organizer:
            organizer["_id"] = str(organizer["_id"])
            organizer["user_id"] = str(organizer["user_id"])
            user["organizer"] = organizer
        else:
            user["organizer"] = None

        result.append(user)

    return result
