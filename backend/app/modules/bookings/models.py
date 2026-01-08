from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Booking(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    # user_id: str
    event_id: str
    ticket_id: str
    quantity: int
    # total_amount: float
    status: str = "PENDING"  # PENDING | CONFIRMED | CANCELLED
    created_at: datetime = datetime.utcnow()
