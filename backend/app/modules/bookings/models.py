from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Booking(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    event_id: str
    ticket_id: str
    quantity: int
    addons: List[dict] = []  # List of {addon_id: str, quantity: int, price: float}
    discount_code: Optional[str] = None
    status: str = "PENDING"
    checked_in: bool = False
    checked_in_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
