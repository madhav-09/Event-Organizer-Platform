from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from app.core.database import db
from app.modules.tickets.models import Ticket
from app.common.utils.dependencies import get_current_user

router = APIRouter(prefix="/tickets", tags=["tickets"])

# Create Ticket (Organizer only)
@router.post("/")
async def create_ticket(ticket: Ticket, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    # Verify event belongs to organizer
    event = await db.events.find_one({"_id": ObjectId(ticket.event_id), "organizer_id": current_user["_id"]})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or not yours")
    result = await db.tickets.insert_one(ticket.dict())
    return {"message": "Ticket created", "ticket_id": str(result.inserted_id)}

# Update Ticket
@router.put("/{ticket_id}")
async def update_ticket(ticket_id: str, data: Ticket, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    existing = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Ticket not found")
    # Verify event belongs to organizer
    event = await db.events.find_one({"_id": ObjectId(existing["event_id"]), "organizer_id": current_user["_id"]})
    if not event:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.tickets.update_one({"_id": ObjectId(ticket_id)}, {"$set": data.dict(exclude_unset=True)})
    return {"message": "Ticket updated"}

# Delete Ticket
@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: str, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    existing = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Ticket not found")
    event = await db.events.find_one({"_id": ObjectId(existing["event_id"]), "organizer_id": current_user["_id"]})
    if not event:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.tickets.delete_one({"_id": ObjectId(ticket_id)})
    return {"message": "Ticket deleted"}

# List Tickets for Event (Public)
@router.get("/event/{event_id}", response_model=List[Ticket])
async def list_tickets(event_id: str):
    tickets_cursor = db.tickets.find({"event_id": event_id})
    tickets = []
    async for t in tickets_cursor:
        t["_id"] = str(t["_id"])
        tickets.append(t)
    return tickets


from app.modules.tickets.service import create_ticket

@router.post("/verify")
def verify_payment(data: dict):
    booking = db.bookings.find_one({"_id": ObjectId(data["booking_id"])})
    
    db.bookings.update_one(
        {"_id": booking["_id"]},
        {"$set": {"status": "CONFIRMED"}}
    )

    ticket_path = create_ticket(booking)

    return {
        "message": "Booking confirmed",
        "ticket": ticket_path
    }



@router.post("/scan")
def scan_ticket(code: str):
    booking = db.bookings.find_one({"_id": ObjectId(code)})

    if not booking or booking["status"] != "CONFIRMED":
        return {"valid": False}

    return {"valid": True}


