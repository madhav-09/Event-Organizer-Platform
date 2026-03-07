from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Booking(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    event_id: str
    ticket_id: str
    quantity: int
    discount_code: Optional[str] = None   # ← new: applied coupon code
    status: str = "PENDING"  # PENDING | CONFIRMED | CANCELLED
    checked_in: bool = False
    checked_in_at: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()
