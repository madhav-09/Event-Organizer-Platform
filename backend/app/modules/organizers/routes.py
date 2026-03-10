from fastapi import APIRouter, Depends, HTTPException, Query, Body
from pydantic import BaseModel
from app.common.utils.dependencies import get_current_user
from app.common.utils.email import send_email
from app.core.database import db
from app.modules.organizers.models import Organizer, OrganizerApply
from bson import ObjectId
from datetime import datetime
import asyncio

router = APIRouter(prefix="/organizers", tags=["organizers"])


# ================= APPLY AS ORGANIZER =================
@router.post("/apply")
async def apply_organizer(
    data: OrganizerApply,
    current_user=Depends(get_current_user(required_role="USER"))
):
    existing = await db.organizers.find_one({"user_id": current_user["_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")

    doc = data.model_dump()
    doc["user_id"] = current_user["_id"]
    doc["kyc_status"] = "PENDING"
    doc["created_at"] = datetime.utcnow()
    result = await db.organizers.insert_one(doc)
    return {
        "message": "Organizer application submitted",
        "organizer_id": str(result.inserted_id),
    }


# ================= ORGANIZER PROFILE =================
@router.get("/me")
async def get_organizer(
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    # Depending on how apply_organizer inserted, user_id might be ObjectId or string
    organizer = await db.organizers.find_one({
        "$or": [
            {"user_id": current_user["_id"]},
            {"user_id": str(current_user["_id"])}
        ]
    })
    
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer profile not found")
        
    organizer["_id"] = str(organizer["_id"])
    organizer["user_id"] = str(organizer["user_id"])
    return organizer

@router.put("/me")
async def update_organizer(
    payload: dict = Body(...),
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    update_data = {}
    allowed_fields = [
        "brand_name", "contact_name", "contact_email", "contact_phone",
        "address_line1", "address_line2", "city", "state", "pincode",
        "country", "description", "website"
    ]
    
    for field in allowed_fields:
        if field in payload:
            update_data[field] = payload[field]
            
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
        
    result = await db.organizers.update_one(
        {
            "$or": [
                {"user_id": current_user["_id"]},
                {"user_id": str(current_user["_id"])}
            ]
        },
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        return {"message": "No changes made"}
        
    return {"message": "Organizer profile updated successfully"}


# ================= ORGANIZER EVENTS =================
@router.get("/me/events")
async def organizer_events(
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    events = []
    cursor = db.events.find({"organizer_id": current_user["_id"]})

    async for e in cursor:
        bookings_count = await db.bookings.count_documents({
            "event_id": str(e["_id"]),
            "status": {"$in": ["CONFIRMED", "PENDING"]}
            
        })

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

# ================= EVENT BOOKINGS (ORGANIZER) =================
@router.get("/me/events/{event_id}/bookings")
async def event_bookings(
    event_id: str,
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    # 1️⃣ Validate event belongs to organizer
    event = await db.events.find_one({
        "_id": ObjectId(event_id),
        "organizer_id": current_user["_id"]
    })

    if not event:
        raise HTTPException(status_code=404, detail="Event not found or not yours")

    bookings = []

    cursor = db.bookings.find({
        "event_id": event_id,
        "status": {"$in": ["CONFIRMED", "PENDING"]}
    })

    async for b in cursor:
        user = await db.users.find_one(
            {"_id": ObjectId(b["user_id"])},
            {"name": 1, "email": 1}
        )

        ticket = await db.tickets.find_one(
            {"_id": ObjectId(b["ticket_id"])},
            {"title": 1}
        )

        bookings.append({
            "booking_id": str(b["_id"]),
            "user": {
                "name": user["name"],
                "email": user["email"],
            },
            "ticket": ticket["title"],
            "quantity": b["quantity"],
            "status": b["status"],
            "checked_in": b.get("checked_in", False),
            "created_at": b["created_at"],
        })

    return bookings

@router.get("/me/analytics/overview")
async def organizer_analytics_overview(
    event_id: str = Query("ALL"),
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    # Determine event filter
    if event_id == "ALL":
        event_ids = await db.events.distinct(
            "_id", {"organizer_id": current_user["_id"]}
        )
    else:
        event = await db.events.find_one({
            "_id": ObjectId(event_id),
            "organizer_id": current_user["_id"]
        })
        if not event:
            raise HTTPException(404, "Event not found")
        event_ids = [ObjectId(event_id)]

    # KPIs
    total_events = len(event_ids)

    registrations = await db.bookings.count_documents({
        "event_id": {"$in": [str(eid) for eid in event_ids]},
        "status": "CONFIRMED"
    })

    revenue_cursor = db.bookings.aggregate([
        {
            "$match": {
                "event_id": {"$in": [str(eid) for eid in event_ids]},
                "status": "CONFIRMED"
            }
        },
        {
            "$group": {
                "_id": None,
                "total": {"$sum": "$total_amount"}
            }
        }
    ])

    revenue_result = await revenue_cursor.to_list(1)
    revenue = revenue_result[0]["total"] if revenue_result else 0

    checked_in = await db.bookings.count_documents({
        "event_id": {"$in": [str(eid) for eid in event_ids]},
        "checked_in": True
    })

    not_checked_in = await db.bookings.count_documents({
        "event_id": {"$in": [str(eid) for eid in event_ids]},
        "checked_in": {"$ne": True}
    })

    return {
        "total_events": total_events if event_id == "ALL" else 1,
        "registrations": registrations,
        "revenue": revenue,
        "checked_in": checked_in,
        "not_checked_in": not_checked_in
    }

@router.get("/me/analytics/registrations")
async def registrations_trend(
    event_id: str = Query("ALL"),
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    match = {
        "status": "CONFIRMED"
    }

    if event_id != "ALL":
        match["event_id"] = event_id
    else:
        event_ids = await db.events.distinct(
            "_id", {"organizer_id": current_user["_id"]}
        )
        match["event_id"] = {"$in": [str(eid) for eid in event_ids]}

    pipeline = [
        {"$match": match},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]

    data = await db.bookings.aggregate(pipeline).to_list(None)
    return data

@router.get("/me/analytics/revenue")
async def revenue_trend(
    event_id: str = Query("ALL"),
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    match = {"status": "CONFIRMED"}

    if event_id != "ALL":
        match["event_id"] = event_id
    else:
        event_ids = await db.events.distinct(
            "_id", {"organizer_id": current_user["_id"]}
        )
        match["event_id"] = {"$in": [str(eid) for eid in event_ids]}

    pipeline = [
        {"$match": match},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                },
                "revenue": {"$sum": "$total_amount"}
            }
        },
        {"$sort": {"_id": 1}}
    ]

    data = await db.bookings.aggregate(pipeline).to_list(None)
    return data

@router.get("/me/analytics/tickets")
async def ticket_distribution(
    event_id: str = Query("ALL"),
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    match = {"status": "CONFIRMED"}

    if event_id != "ALL":
        match["event_id"] = event_id
    else:
        event_ids = await db.events.distinct(
            "_id", {"organizer_id": current_user["_id"]}
        )
        match["event_id"] = {"$in": [str(eid) for eid in event_ids]}

    pipeline = [
        {"$match": match},
        {
            "$lookup": {
                "from": "tickets",
                "localField": "ticket_id",
                "foreignField": "_id",
                "as": "ticket"
            }
        },
        {"$unwind": "$ticket"},
        {
            "$group": {
                "_id": "$ticket.title",
                "count": {"$sum": "$quantity"}
            }
        }
    ]

    data = await db.bookings.aggregate(pipeline).to_list(None)
    return data

@router.get("/me/analytics/checkin")
async def checkin_distribution(
    event_id: str = Query("ALL"),
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    match = {}

    if event_id != "ALL":
        match["event_id"] = event_id
    else:
        event_ids = await db.events.distinct(
            "_id", {"organizer_id": current_user["_id"]}
        )
        match["event_id"] = {"$in": [str(eid) for eid in event_ids]}

    checked_in = await db.bookings.count_documents({**match, "checked_in": True})
    not_checked_in = await db.bookings.count_documents({**match, "checked_in": {"$ne": True}})

    return {
        "checked_in": checked_in,
        "not_checked_in": not_checked_in
    }

@router.get("/me/analytics/recent-bookings")
async def recent_bookings(
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    pipeline = [
        # 🔑 Convert string event_id → ObjectId
        {
            "$addFields": {
                "eventObjectId": { "$toObjectId": "$event_id" }
            }
        },
        {
            "$lookup": {
                "from": "events",
                "localField": "eventObjectId",
                "foreignField": "_id",
                "as": "event"
            }
        },
        {"$unwind": "$event"},
        {
            "$match": {
                "event.organizer_id": current_user["_id"]
            }
        },
        {"$sort": {"created_at": -1}},
        {"$limit": 10}
    ]

    bookings = []
    cursor = db.bookings.aggregate(pipeline)

    async for b in cursor:
        user = await db.users.find_one(
            {"_id": ObjectId(b["user_id"])},
            {"name": 1, "email": 1}
        )

        bookings.append({
            "user": {
                "name": user["name"],
                "email": user["email"],
            },
            "event": b["event"]["title"],
            "quantity": b["quantity"],
            "amount": b["total_amount"],
            "status": b["status"],
            "created_at": b["created_at"],
        })

    return bookings


# ================= EMAIL BLAST =================
class EmailBlastRequest(BaseModel):
    event_id: str
    target: str  # all | checked_in | not_checked_in
    subject: str
    body: str


@router.post("/me/email-blast")
async def send_email_blast(
    payload: EmailBlastRequest,
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    # 1. Verify event belongs to organizer
    event = await db.events.find_one({
        "_id": ObjectId(payload.event_id),
        "organizer_id": current_user["_id"]
    })
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or not yours")

    # 2. Build booking filter by target
    booking_filter: dict = {"event_id": payload.event_id, "status": "CONFIRMED"}
    if payload.target == "checked_in":
        booking_filter["checked_in"] = True
    elif payload.target == "not_checked_in":
        booking_filter["checked_in"] = {"$ne": True}
    # "all" = no extra filter

    # 3. Collect unique attendee emails
    recipients = []
    seen_user_ids = set()
    cursor = db.bookings.find(booking_filter)
    async for booking in cursor:
        uid = str(booking["user_id"])
        if uid in seen_user_ids:
            continue
        seen_user_ids.add(uid)
        user = await db.users.find_one(
            {"_id": ObjectId(uid)},
            {"name": 1, "email": 1}
        )
        if user and user.get("email"):
            recipients.append({"name": user.get("name", "Attendee"), "email": user["email"]})

    if not recipients:
        raise HTTPException(status_code=400, detail="No recipients found for selected target")

    # 4. Get organizer name
    organizer = await db.organizers.find_one({
        "$or": [
            {"user_id": current_user["_id"]},
            {"user_id": str(current_user["_id"])}
        ]
    })
    organizer_name = organizer.get("brand_name") or current_user.get("name", "Event Organizer") if organizer else current_user.get("name", "Event Organizer")

    # 5. Send emails concurrently (best-effort — log failures)
    success_count = 0
    failed_count = 0

    async def _send_one(recipient: dict):
        nonlocal success_count, failed_count
        try:
            await send_email(
                to_email=recipient["email"],
                subject=payload.subject,
                template_name="email_blast.html",
                context={
                    "subject": payload.subject,
                    "body": payload.body,
                    "attendee_name": recipient["name"],
                    "event_name": event["title"],
                    "organizer_name": organizer_name,
                },
            )
            success_count += 1
        except Exception as e:
            failed_count += 1
            print(f"Email blast failed for {recipient['email']}: {e}")

    await asyncio.gather(*[_send_one(r) for r in recipients])

    # 6. Store blast record in DB
    target_label = {"all": "All Attendees", "checked_in": "Checked In", "not_checked_in": "Not Checked In"}.get(payload.target, payload.target)
    blast_record = {
        "organizer_id": str(current_user["_id"]),
        "event_id": payload.event_id,
        "event_title": event["title"],
        "subject": payload.subject,
        "body": payload.body,
        "target": payload.target,
        "target_label": target_label,
        "recipients": success_count,
        "failed": failed_count,
        "sent_at": datetime.utcnow(),
    }
    await db.email_blasts.insert_one(blast_record)

    return {
        "message": f"Email blast sent to {success_count} recipient(s)",
        "recipients": success_count,
        "failed": failed_count,
    }


@router.get("/me/email-blast/history")
async def get_email_blast_history(
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    history = []
    cursor = db.email_blasts.find(
        {"organizer_id": str(current_user["_id"])}
    ).sort("sent_at", -1).limit(50)

    async for doc in cursor:
        history.append({
            "id": str(doc["_id"]),
            "event_id": doc.get("event_id"),
            "event_title": doc.get("event_title", ""),
            "subject": doc["subject"],
            "target": doc.get("target_label", doc.get("target", "")),
            "recipients": doc.get("recipients", 0),
            "failed": doc.get("failed", 0),
            "sent_at": doc["sent_at"].isoformat(),
        })

    return history
