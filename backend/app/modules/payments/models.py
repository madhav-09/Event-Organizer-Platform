from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Payment(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    booking_id: str
    order_id: str
    payment_id: Optional[str] = None
    amount: float
    status: str = "CREATED"  # CREATED | PAID | FAILED
    created_at: datetime = datetime.utcnow()
