from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.core.database import db
from app.core.payment import client
from typing import Optional
from app.core.payment import client as razorpay_client

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
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": payload["order_id"],
            "razorpay_payment_id": payload["payment_id"],
            "razorpay_signature": payload["signature"],
        })
    except:
        raise HTTPException(400, "Payment verification failed")

    await db.payments.update_one(
        {"order_id": payload["order_id"]},
        {"$set": {
            "payment_id": payload["payment_id"],
            "status": "PAID"
        }}
    )

    await db.bookings.update_one(
        {"_id": ObjectId(payload["booking_id"])},
        {"$set": {"status": "CONFIRMED"}}
    )

    return {"message": "Payment verified"}


@router.post("/refund")
def refund_payment(
    payment_id: str,
    amount: Optional[int] = None
):
    try:
        refund = client.payment.refund(payment_id, {
            "amount": amount
        } if amount else None)

        db.refunds.insert_one({
            "payment_id": payment_id,
            "refund_id": refund["id"],
            "amount": refund["amount"],
            "status": refund["status"]
        })

        return refund

    except Exception as e:
        raise HTTPException(400, str(e))
    
    
@router.post("/verify")
def verify_payment(data: dict):
    db.bookings.update_one(
        {"_id": ObjectId(data["booking_id"])},
        {"$set": {
            "payment_id": data["payment_id"],
            "status": "CONFIRMED"
        }}
    )
    return {"message": "Booking confirmed"}
    
    
    