from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.core.database import db
from app.core.payment import client

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/create-order/{booking_id}")
async def create_payment_order(booking_id: str):
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    amount = int(booking["total_amount"] * 100)

    order = client.order.create({
        "amount": amount,
        "currency": "INR",
        "payment_capture": 1
    })

    await db.payments.insert_one({
        "booking_id": booking_id,
        "order_id": order["id"],
        "amount": booking["total_amount"],
        "status": "CREATED"
    })

    return {
        "order_id": order["id"],
        "amount": amount,
        "currency": "INR",
        "key": client.auth[0]
    }





@router.post("/verify")
async def verify_payment(payload: dict):
    order_id = payload.get("order_id")
    payment_id = payload.get("payment_id")

    payment = await db.payments.find_one({"order_id": order_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    await db.payments.update_one(
        {"order_id": order_id},
        {"$set": {"payment_id": payment_id, "status": "PAID"}}
    )

    await db.bookings.update_one(
        {"_id": ObjectId(payment["booking_id"])},
        {"$set": {"status": "CONFIRMED"}}
    )

    return {"message": "Payment verified, booking confirmed"}
