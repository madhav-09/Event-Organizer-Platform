from fastapi import APIRouter, HTTPException
from bson import ObjectId
from typing import Optional
from datetime import datetime
import logging
from app.core.database import db
from app.core.payment import client as razorpay_client
from app.common.utils.email import send_email
from app.common.utils.pdf import generate_ticket_pdf

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)


# ---------------------------------------------------
# CREATE PAYMENT ORDER
# ---------------------------------------------------
@router.post("/create-order/{booking_id}")
async def create_payment_order(booking_id: str):

    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})

    if not booking:
        raise HTTPException(404, "Booking not found")

    if booking["status"] != "PENDING":
        raise HTTPException(400, "Booking already processed")

    if booking["expires_at"] < datetime.utcnow():
        raise HTTPException(400, "Booking expired. Please book again.")

    amount = int(booking["total_amount"] * 100)

    order = razorpay_client.order.create({
        "amount": amount,
        "currency": "INR",
        "payment_capture": 1
    })

    await db.payments.insert_one({
        "booking_id": booking_id,
        "order_id": order["id"],
        "amount": booking["total_amount"],
        "status": "CREATED",
        "created_at": datetime.utcnow()
    })

    return {
        "order_id": order["id"],
        "amount": amount,
        "currency": "INR",
        "key": razorpay_client.auth[0]
    }


# ---------------------------------------------------
# VERIFY PAYMENT
# ---------------------------------------------------
@router.post("/verify")
async def verify_payment(payload: dict):

    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": payload["order_id"],
            "razorpay_payment_id": payload["payment_id"],
            "razorpay_signature": payload["signature"],
        })
    except Exception:
        raise HTTPException(400, "Payment verification failed")

    payment = await db.payments.find_one({"order_id": payload["order_id"]})
    if not payment:
        raise HTTPException(404, "Payment record not found")

    booking = await db.bookings.find_one({"_id": ObjectId(payment["booking_id"])})
    if not booking:
        raise HTTPException(404, "Booking not found")

    if booking["status"] == "CONFIRMED":
        return {"message": "Payment already verified"}

    # update payment
    await db.payments.update_one(
        {"order_id": payload["order_id"]},
        {
            "$set": {
                "payment_id": payload["payment_id"],
                "status": "PAID",
                "paid_at": datetime.utcnow()
            }
        }
    )

    # confirm booking
    await db.bookings.update_one(
        {"_id": booking["_id"]},
        {"$set": {"status": "CONFIRMED"}}
    )

    ticket = await db.tickets.find_one({"_id": ObjectId(booking["ticket_id"])})
    event = await db.events.find_one({"_id": ObjectId(booking["event_id"])})
    user = await db.users.find_one({"_id": ObjectId(booking["user_id"])})

    ticket_payload = {
        "booking_id": str(booking["_id"]),
        "event_name": event["title"],
        "event_date": event["start_date"].strftime("%d %b %Y"),
        "event_time": event["start_date"].strftime("%I:%M %p"),
        "venue": event.get("venue") or event.get("city"),
        "user_name": user["name"],
        "ticket_title": ticket["title"],
        "quantity": booking["quantity"],
        "total_amount": booking["total_amount"],
    }

    pdf_bytes = generate_ticket_pdf(ticket_payload)

    try:
        await send_email(
            to_email=user["email"],
            subject=f"Ticket Confirmed: {event['title']}",
            template_name="ticket_booking.html",
            context=ticket_payload,
            pdf_bytes=pdf_bytes,
            pdf_filename=f"{event['title']}_ticket.pdf"
        )
    except Exception as e:
        logger.warning("Ticket email failed for %s: %s", user["email"], e)

    return {"message": "Payment verified and ticket sent"}


# ---------------------------------------------------
# REFUND PAYMENT
# ---------------------------------------------------
@router.post("/refund")
async def refund_payment(
    payment_id: str,
    amount: Optional[int] = None
):

    try:

        refund = razorpay_client.payment.refund(
            payment_id,
            {"amount": amount} if amount else None
        )

        await db.refunds.insert_one({
            "payment_id": payment_id,
            "refund_id": refund["id"],
            "amount": refund["amount"],
            "status": refund["status"],
            "created_at": datetime.utcnow()
        })

        return refund

    except Exception as e:
        raise HTTPException(400, str(e))