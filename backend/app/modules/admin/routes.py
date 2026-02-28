from fastapi import APIRouter, Depends, HTTPException, Query
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


@router.get("/analytics/overview")
async def analytics_overview(current_user=Depends(get_current_user())):
    admin_only(current_user)

    total_events = await db.events.count_documents({})
    total_users = await db.users.count_documents({"is_blocked": {"$ne": True}})
    total_organizers = await db.organizers.count_documents({})

    bookings_cursor = db.bookings.aggregate([
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "revenue": {"$sum": "$total_amount"}
            }
        }
    ])
    status_counts = {"PENDING": 0, "CONFIRMED": 0, "CANCELLED": 0}
    total_revenue = 0
    total_bookings = 0
    async for doc in bookings_cursor:
        status_counts[doc["_id"]] = doc["count"]
        total_bookings += doc["count"]
        if doc["_id"] == "CONFIRMED":
            total_revenue = doc["revenue"]

    return {
        "total_events": total_events,
        "total_users": total_users,
        "total_organizers": total_organizers,
        "total_bookings": total_bookings,
        "total_revenue": round(total_revenue, 2),
        "pending_bookings": status_counts.get("PENDING", 0),
        "confirmed_bookings": status_counts.get("CONFIRMED", 0),
        "cancelled_bookings": status_counts.get("CANCELLED", 0),
    }


@router.get("/analytics/revenue-trend")
async def revenue_trend(
    current_user=Depends(get_current_user()),
    days: int = Query(30, ge=1, le=90),
):
    admin_only(current_user)
    from datetime import datetime, timedelta

    start = datetime.utcnow() - timedelta(days=days)
    pipeline = [
        {"$match": {"status": "CONFIRMED", "created_at": {"$gte": start}}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "revenue": {"$sum": "$total_amount"},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
        {"$project": {"date": "$_id", "revenue": 1, "count": 1, "_id": 0}},
    ]
    result = await db.bookings.aggregate(pipeline).to_list(None)
    return result


@router.get("/analytics/top-events")
async def top_events(
    current_user=Depends(get_current_user()),
    limit: int = Query(10, ge=1, le=50),
):
    admin_only(current_user)

    pipeline = [
        {"$match": {"status": "CONFIRMED"}},
        {
            "$group": {
                "_id": "$event_id",
                "tickets_sold": {"$sum": "$quantity"},
                "revenue": {"$sum": "$total_amount"},
                "bookings_count": {"$sum": 1},
            }
        },
        {"$sort": {"revenue": -1}},
        {"$limit": limit},
        {
            "$lookup": {
                "from": "events",
                "localField": "_id",
                "foreignField": "_id",
                "as": "event",
            }
        },
        {"$unwind": {"path": "$event", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "event_id": {"$toString": "$_id"},
                "title": "$event.title",
                "city": "$event.city",
                "tickets_sold": 1,
                "revenue": {"$round": ["$revenue", 2]},
                "bookings_count": 1,
            }
        },
    ]
    pipeline = [
        {"$match": {"status": "CONFIRMED"}},
        {
            "$group": {
                "_id": "$event_id",
                "tickets_sold": {"$sum": "$quantity"},
                "revenue": {"$sum": "$total_amount"},
                "bookings_count": {"$sum": 1},
            }
        },
        {"$sort": {"revenue": -1}},
        {"$limit": limit},
    ]
    results = await db.bookings.aggregate(pipeline).to_list(None)
    out = []
    for r in results:
        eid = r["_id"]
        try:
            event = await db.events.find_one({"_id": ObjectId(eid)}, {"title": 1, "city": 1})
        except Exception:
            event = None
        out.append({
            "event_id": eid,
            "title": (event or {}).get("title", "Unknown"),
            "city": (event or {}).get("city", ""),
            "tickets_sold": r["tickets_sold"],
            "revenue": round(r["revenue"], 2),
            "bookings_count": r["bookings_count"],
        })
    return out


@router.get("/analytics/recent-activity")
async def recent_activity(
    current_user=Depends(get_current_user()),
    limit: int = Query(15, ge=1, le=50),
):
    admin_only(current_user)

    cursor = db.bookings.find().sort("created_at", -1).limit(limit)
    out = []
    async for b in cursor:
        event = await db.events.find_one(
            {"_id": ObjectId(b["event_id"])},
            {"title": 1},
        ) if b.get("event_id") else None
        user = await db.users.find_one(
            {"_id": b["user_id"]},
            {"name": 1, "email": 1},
        ) if b.get("user_id") else None
        out.append({
            "booking_id": str(b["_id"]),
            "event_title": (event or {}).get("title", "Unknown"),
            "user_name": (user or {}).get("name", "—"),
            "user_email": (user or {}).get("email", "—"),
            "quantity": b.get("quantity", 0),
            "amount": b.get("total_amount", 0),
            "status": b.get("status", "PENDING"),
            "created_at": b["created_at"].isoformat() if b.get("created_at") and hasattr(b["created_at"], "isoformat") else str(b.get("created_at", "")),
        })
    return out


@router.get("/analytics/bookings-by-status")
async def bookings_by_status(current_user=Depends(get_current_user())):
    admin_only(current_user)

    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = await db.bookings.aggregate(pipeline).to_list(None)
    return [{"status": r["_id"], "count": r["count"]} for r in result]


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
async def get_users(current_user=Depends(get_current_user())):
    admin_only(current_user)

    cursor = db.users.find({})
    result = []

    async for user in cursor:
        user_id = user.get("_id")
        if not user_id:
            continue

        organizer = await db.organizers.find_one({"user_id": user_id})

        result.append({
            "_id": str(user_id),
            "id": str(user_id),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "USER"),
            "is_blocked": bool(user.get("is_blocked", False)),
            "organizer": {
                "_id": str(organizer["_id"]),
                "brand_name": organizer.get("brand_name", ""),
                "kyc_status": organizer.get("kyc_status", "PENDING"),
            } if organizer else None,
        })

    return result


@router.put("/users/{user_id}/block")
async def block_user(user_id: str, current_user=Depends(get_current_user())):
    admin_only(current_user)
    if user_id == str(current_user["_id"]):
        raise HTTPException(status_code=400, detail="Cannot block yourself")

    u = await db.users.find_one({"_id": ObjectId(user_id)})
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_blocked": True}},
    )
    return {"message": "User blocked"}


@router.put("/users/{user_id}/unblock")
async def unblock_user(user_id: str, current_user=Depends(get_current_user())):
    admin_only(current_user)

    u = await db.users.find_one({"_id": ObjectId(user_id)})
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_blocked": False}},
    )
    return {"message": "User unblocked"}

