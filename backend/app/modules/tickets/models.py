from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Ticket(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    event_id: str
    title: str
    price: float
    quantity: int  # Total tickets available
    sold: int = 0  # Tickets sold
    created_at: datetime = datetime.utcnow()
