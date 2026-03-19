from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from bson import ObjectId
from bson.errors import InvalidId
from app.core.database import db
from app.common.utils.dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


def _to_object_id(id_str: str) -> ObjectId:
    """Safely convert a string to ObjectId, raising 422 on invalid input."""
    try:
        return ObjectId(id_str)
    except (InvalidId, Exception):
        raise HTTPException(status_code=422, detail=f"Invalid ID format: {id_str}")


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
async def approve_organizer(
    organizer_id: str,
    current_user=Depends(get_current_user("ADMIN"))
):
    oid = _to_object_id(organizer_id)
    organizer = await db.organizers.find_one({"_id": oid})
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer not found")

    await db.organizers.update_one(
        {"_id": oid},
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
    current_user=Depends(get_current_user("ADMIN"))
):
    oid = _to_object_id(organizer_id)
    organizer = await db.organizers.find_one({"_id": oid})
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer not found")

    await db.organizers.update_one(
        {"_id": oid},
        {"$set": {"kyc_status": "REJECTED"}}
    )

    return {"message": "Organizer rejected"}


@router.put("/events/{event_id}/publish")
async def publish_event(
    event_id: str,
    current_user=Depends(get_current_user("ADMIN"))
):
    oid = _to_object_id(event_id)
    event = await db.events.find_one({"_id": oid})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.events.update_one({"_id": oid}, {"$set": {"status": "PUBLISHED"}})
    return {"message": "Event published"}


@router.put("/events/{event_id}/unpublish")
async def unpublish_event(
    event_id: str,
    current_user=Depends(get_current_user("ADMIN"))
):
    oid = _to_object_id(event_id)
    event = await db.events.find_one({"_id": oid})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.events.update_one({"_id": oid}, {"$set": {"status": "DRAFT"}})
    return {"message": "Event unpublished"}


@router.put("/events/{event_id}/cancel")
async def cancel_event(
    event_id: str,
    current_user=Depends(get_current_user("ADMIN"))
):
    oid = _to_object_id(event_id)
    event = await db.events.find_one({"_id": oid})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.events.update_one({"_id": oid}, {"$set": {"status": "CANCELLED"}})
    return {"message": "Event cancelled"}


@router.get("/events")
async def admin_list_events(
    current_user=Depends(get_current_user("ADMIN")),
    status: Optional[str] = Query(None, description="Filter: DRAFT, PUBLISHED, CANCELLED"),
    q: Optional[str] = Query(None, description="Search by title, city, or category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = {}
    if status and status.strip():
        query["status"] = status.strip().upper()
    if q and q.strip():
        import re
        term = re.escape(q.strip())
        regex = {"$regex": term, "$options": "i"}
        query["$or"] = [
            {"title": regex},
            {"city": regex},
            {"category": regex},
            {"venue": regex},
        ]

    cursor = db.events.find(query).sort("created_at", -1).skip(skip).limit(limit)
    _db_events = await cursor.to_list(length=limit)

    event_ids = [str(e["_id"]) for e in _db_events]
    organizer_ids = list(set([e["organizer_id"] for e in _db_events if e.get("organizer_id")]))

    organizers_db = await db.organizers.find(
        {"user_id": {"$in": organizer_ids}},
        {"user_id": 1, "brand_name": 1}
    ).to_list(None)
    organizer_map = {str(org["user_id"]): org.get("brand_name", "—") for org in organizers_db}

    bookings_agg = await db.bookings.aggregate([
        {"$match": {"event_id": {"$in": event_ids}}},
        {
            "$group": {
                "_id": "$event_id",
                "bookings_count": {"$sum": 1},
                "revenue": {"$sum": "$total_amount"},
                "confirmed_revenue": {"$sum": {"$cond": [{"$eq": ["$status", "CONFIRMED"]}, "$total_amount", 0]}},
            }
        }
    ]).to_list(None)
    bookings_map = {b["_id"]: b for b in bookings_agg}

    events = []
    for e in _db_events:
        eid = str(e["_id"])
        org_id_str = str(e["organizer_id"]) if e.get("organizer_id") else ""
        org_name = organizer_map.get(org_id_str, "—")
        stats = bookings_map.get(eid, {"bookings_count": 0, "revenue": 0, "confirmed_revenue": 0})

        start = e.get("start_date")
        start_iso = start.isoformat() if start and hasattr(start, "isoformat") else str(start or "")
        end = e.get("end_date")
        end_iso = end.isoformat() if end and hasattr(end, "isoformat") else str(end or "")
        created = e.get("created_at")
        created_iso = created.isoformat() if created and hasattr(created, "isoformat") else str(created or "")

        events.append({
            "_id": eid,
            "id": eid,
            "title": e.get("title", ""),
            "description": e.get("description", ""),
            "category": e.get("category", ""),
            "city": e.get("city", ""),
            "venue": e.get("venue", ""),
            "start_date": start_iso,
            "end_date": end_iso,
            "banner_url": e.get("banner_url"),
            "status": e.get("status", "DRAFT"),
            "organizer_id": org_id_str,
            "organizer_name": org_name,
            "bookings_count": stats.get("bookings_count", 0),
            "revenue": round(stats.get("confirmed_revenue", 0), 2),
            "created_at": created_iso,
        })

    total = await db.events.count_documents(query)
    return {"events": events, "total": total}


@router.get("/bookings")
async def all_bookings(current_user=Depends(get_current_user("ADMIN"))):
    cursor = db.bookings.find()
    bookings = []
    async for b in cursor:
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
async def revenue_analytics(current_user=Depends(get_current_user("ADMIN"))):
    pipeline = [
        {"$match": {"status": "CONFIRMED"}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}}}
    ]
    result = await db.bookings.aggregate(pipeline).to_list(length=1)
    return result[0] if result else {"total_revenue": 0}


@router.get("/analytics/overview")
async def analytics_overview(current_user=Depends(get_current_user("ADMIN"))):
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
    current_user=Depends(get_current_user("ADMIN")),
    days: int = Query(30, ge=1, le=90),
):
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
    current_user=Depends(get_current_user("ADMIN")),
    limit: int = Query(10, ge=1, le=50),
):
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

    event_ids = []
    for r in results:
        try:
            event_ids.append(ObjectId(str(r["_id"])))
        except Exception:
            pass

    events_db = await db.events.find({"_id": {"$in": event_ids}}, {"title": 1, "city": 1}).to_list(None)
    events_map = {str(e["_id"]): e for e in events_db}

    out = []
    for r in results:
        eid = r["_id"]
        event = events_map.get(eid, {})
        out.append({
            "event_id": eid,
            "title": event.get("title", "Unknown"),
            "city": event.get("city", ""),
            "tickets_sold": r["tickets_sold"],
            "revenue": round(r["revenue"], 2),
            "bookings_count": r["bookings_count"],
        })
    return out


@router.get("/analytics/recent-activity")
async def recent_activity(
    current_user=Depends(get_current_user("ADMIN")),
    limit: int = Query(15, ge=1, le=50),
):
    _db_bookings = await db.bookings.find().sort("created_at", -1).limit(limit).to_list(None)

    event_ids = []
    user_ids = []
    for b in _db_bookings:
        if b.get("event_id"):
            try:
                event_ids.append(ObjectId(str(b["event_id"])))
            except Exception:
                pass
        if b.get("user_id"):
            try:
                user_ids.append(ObjectId(str(b["user_id"])))
            except Exception:
                pass

    events_db = await db.events.find({"_id": {"$in": event_ids}}, {"title": 1}).to_list(None)
    events_map = {str(e["_id"]): e for e in events_db}

    users_db = await db.users.find({"_id": {"$in": user_ids}}, {"name": 1, "email": 1}).to_list(None)
    users_map = {str(u["_id"]): u for u in users_db}

    out = []
    for b in _db_bookings:
        eid = str(b.get("event_id", ""))
        uid = str(b.get("user_id", ""))
        event = events_map.get(eid, {})
        user = users_map.get(uid, {})

        created = b.get("created_at")
        created_iso = created.isoformat() if created and hasattr(created, "isoformat") else str(created or "")

        out.append({
            "booking_id": str(b["_id"]),
            "event_title": event.get("title", "Unknown"),
            "user_name": user.get("name", "—"),
            "user_email": user.get("email", "—"),
            "quantity": b.get("quantity", 0),
            "amount": b.get("total_amount", 0),
            "status": b.get("status", "PENDING"),
            "created_at": created_iso,
        })
    return out


@router.get("/analytics/bookings-by-status")
async def bookings_by_status(current_user=Depends(get_current_user("ADMIN"))):
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = await db.bookings.aggregate(pipeline).to_list(None)
    return [{"status": r["_id"], "count": r["count"]} for r in result]


@router.get("/analytics/events")
async def event_sales(current_user=Depends(get_current_user("ADMIN"))):
    pipeline = [
        {"$group": {
            "_id": "$event_id",
            "tickets_sold": {"$sum": "$quantity"},
            "revenue": {"$sum": "$total_amount"}
        }}
    ]
    return await db.bookings.aggregate(pipeline).to_list(None)


@router.get("/analytics/organizers")
async def organizer_stats(current_user=Depends(get_current_user("ADMIN"))):
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
async def get_users(
    current_user=Depends(get_current_user("ADMIN")),
    q: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[str] = Query(None, description="Filter by role: USER, ORGANIZER, ADMIN"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query: dict = {}
    if q and q.strip():
        import re
        term = re.escape(q.strip())
        regex = {"$regex": term, "$options": "i"}
        query["$or"] = [{"name": regex}, {"email": regex}]
    if role and role.strip():
        query["role"] = role.strip().upper()

    _db_users = await db.users.find(query).skip(skip).limit(limit).to_list(None)
    total = await db.users.count_documents(query)

    user_ids = [u["_id"] for u in _db_users if "_id" in u]
    organizers_db = await db.organizers.find({"user_id": {"$in": user_ids}}).to_list(None)
    organizers_map = {str(org["user_id"]): org for org in organizers_db}

    result = []
    for user in _db_users:
        user_id = user.get("_id")
        if not user_id:
            continue

        uid_str = str(user_id)
        organizer = organizers_map.get(uid_str)

        result.append({
            "_id": uid_str,
            "id": uid_str,
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

    return {"users": result, "total": total}


@router.put("/users/{user_id}/block")
async def block_user(
    user_id: str,
    current_user=Depends(get_current_user("ADMIN"))
):
    if user_id == str(current_user["_id"]):
        raise HTTPException(status_code=400, detail="Cannot block yourself")

    oid = _to_object_id(user_id)
    u = await db.users.find_one({"_id": oid})
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one({"_id": oid}, {"$set": {"is_blocked": True}})
    return {"message": "User blocked"}


@router.put("/users/{user_id}/unblock")
async def unblock_user(
    user_id: str,
    current_user=Depends(get_current_user("ADMIN"))
):
    oid = _to_object_id(user_id)
    u = await db.users.find_one({"_id": oid})
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one({"_id": oid}, {"$set": {"is_blocked": False}})
    return {"message": "User unblocked"}
