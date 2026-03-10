from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AddonDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    event_id: str
    name: str
    description: Optional[str] = None
    price: float
    total_quantity: int
    sold_quantity: int = 0
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
