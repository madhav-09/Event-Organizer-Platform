from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.core.database import db
from app.modules.bookings.models import Booking
from app.common.utils.dependencies import get_current_user
from app.modules.bookings.service import send_ticket_email
from app.modules.tickets.service import create_ticket

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/")
async def create_booking(data: Booking, current_user=Depends(get_current_user(required_role="USER"))):
    ticket = await db.tickets.find_one({"_id": ObjectId(data.ticket_id)})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    available = ticket["quantity"] - ticket["sold"]
    if available < data.quantity:
        raise HTTPException(status_code=400, detail="Not enough tickets")

    total = ticket["price"] * data.quantity

    booking = data.dict()
    booking.update({
        "user_id": current_user["_id"],
        "event_id": ticket["event_id"],
        "total_amount": total,
        "status": "PENDING"
    })

    # Atomic stock update
    await db.tickets.update_one(
        {"_id": ObjectId(data.ticket_id)},
        {"$inc": {"sold": data.quantity}}
    )

    result = await db.bookings.insert_one(booking)
    
    ticket_path = create_ticket(booking)
    send_ticket_email(booking["email"], ticket_path)
    
    return {"message": "Booking created", "booking_id": str(result.inserted_id)}



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


    