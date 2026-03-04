from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.core.database import db
from app.modules.bookings.models import Booking
from app.common.utils.dependencies import get_current_user
from app.modules.bookings.service import send_ticket_email
from app.modules.tickets.service import create_ticket
from app.common.utils.email import send_email
from app.common.utils.pdf import generate_ticket_pdf

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/")
async def create_booking(
    data: Booking,
    current_user=Depends(get_current_user())
):
    ticket = await db.tickets.find_one({"_id": ObjectId(data.ticket_id)})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    event = await db.events.find_one({"_id": ObjectId(ticket["event_id"])})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    available = ticket["quantity"] - ticket["sold"]
    if available < data.quantity:
        raise HTTPException(status_code=400, detail="Not enough tickets")

    total = ticket["price"] * data.quantity
    discount_applied = 0
    discount_info = None

    # ── Apply discount code if provided ──────────────────────────────────────
    if data.discount_code:
        code_upper = data.discount_code.strip().upper()
        discount_doc = await db.discount_codes.find_one({"code": code_upper})
        if discount_doc:
            now = datetime.utcnow()
            is_expired = discount_doc.get("expires_at") and discount_doc["expires_at"] < now
            is_exhausted = discount_doc.get("usage_limit") and discount_doc.get("used_count", 0) >= discount_doc["usage_limit"]
            wrong_event = discount_doc.get("event_id") and str(discount_doc["event_id"]) != str(event["_id"])

            if not is_expired and not is_exhausted and not wrong_event:
                if discount_doc["type"] == "PERCENTAGE":
                    discount_applied = round(total * discount_doc["value"] / 100, 2)
                else:  # FIXED_AMOUNT
                    discount_applied = min(discount_doc["value"], total)

                total = max(0, total - discount_applied)
                discount_info = {
                    "code": code_upper,
                    "type": discount_doc["type"],
                    "value": discount_doc["value"],
                    "discount_applied": discount_applied,
                }
                # Increment used_count
                await db.discount_codes.update_one(
                    {"code": code_upper},
                    {"$inc": {"used_count": 1}}
                )

    booking_doc = data.dict()
    booking_doc.update({
        "user_id": current_user["_id"],
        "event_id": str(event["_id"]),
        "total_amount": total,
        "status": "CONFIRMED" if total == 0 else "PENDING"
    })

    await db.tickets.update_one(
        {"_id": ObjectId(data.ticket_id)},
        {"$inc": {"sold": data.quantity}}
    )

    result = await db.bookings.insert_one(booking_doc)
    booking_id = str(result.inserted_id)

    # ---------- BUILD SHARED DATA ----------
    ticket_payload = {
        "booking_id": booking_id,
        "event_id": str(event["_id"]),
        "ticket_id": str(ticket["_id"]),
        "event_name": event["title"],
        "event_date": event["start_date"].strftime("%d %b %Y"),
        "event_time": event["start_date"].strftime("%I:%M %p"),
        "venue": event.get("venue") or event.get("city"),
        "user_name": current_user["name"],
        "ticket_title": ticket["title"],
        "quantity": data.quantity,
        "total_amount": total,
    }

    # ---------- PDF ----------
    pdf_bytes = generate_ticket_pdf(ticket_payload)

    # ---------- EMAIL ----------
    await send_email(
        to_email=current_user["email"],
        subject=f"🎟️ Ticket Confirmed: {event['title']}",
        template_name="ticket_booking.html",
        context=ticket_payload,
        pdf_bytes=pdf_bytes,
        pdf_filename=f"{event['title']}_ticket.pdf"
    )

    return {
        "message": "Booking created",
        "booking_id": booking_id
    }



@router.post("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, current_user=Depends(get_current_user())):
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id), "user_id": current_user["_id"]})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking["status"] != "CONFIRMED":
        raise HTTPException(status_code=400, detail="Only confirmed bookings can be cancelled")

    # Restore ticket stock
    await db.tickets.update_one(
        {"_id": ObjectId(booking["ticket_id"])},
        {"$inc": {"sold": -booking["quantity"]}}
    )

    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "CANCELLED"}}
    )

    await db.payments.update_one(
        {"booking_id": booking_id},
        {"$set": {"status": "REFUNDED"}}
    )

    return {"message": "Booking cancelled & refund initiated"}



@router.post("/confirm")
def confirm_booking(order_id: str):
    payment = db.payments.find_one({"order_id": order_id, "status": "SUCCESS"})

    if not payment:
        raise HTTPException(400, "Payment not completed")

    db.bookings.insert_one({
        "user_id": payment["user_id"],
        "event_id": payment["event_id"],
        "amount": payment["amount"],
        "status": "CONFIRMED"
    })

    return {"message": "Booking confirmed"}



@router.post("/scan")
async def scan_ticket(
    payload: dict,
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    booking_id = payload.get("booking_id")
    event_id = payload.get("event_id")

    if not booking_id or not event_id:
        raise HTTPException(400, "Invalid QR data")

    booking = await db.bookings.find_one({
        "_id": ObjectId(booking_id),
        "event_id": event_id,
        "status": "CONFIRMED"
    })

    if not booking:
        raise HTTPException(404, "Invalid or unpaid ticket")

    if booking.get("checked_in"):
        raise HTTPException(400, "Already checked in")

    await db.bookings.update_one(
        {"_id": booking["_id"]},
        {"$set": {
            "checked_in": True,
            "checked_in_at": datetime.utcnow()
        }}
    )

    return {
        "message": "Check-in successful",
        "booking_id": booking_id
    }
