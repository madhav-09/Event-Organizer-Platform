from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Event(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    organizer_id: str
    title: str
    description: str
    category: str  # TECH | MUSIC | WORKSHOP | etc
    type: str = "ONLINE"  # ONLINE | OFFLINE | HYBRID
    city: Optional[str] = None
    venue: Optional[str] = None
    start_date: datetime
    end_date: datetime
    banner_url: Optional[str] = None
    status: str = "DRAFT"  # DRAFT | PUBLISHED | CANCELLED
    created_at: datetime = datetime.utcnow()
