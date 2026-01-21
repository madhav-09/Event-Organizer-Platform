from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class EventDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")

    organizer_id: str
    title: str
    description: Optional[str]
    category: str
    type: str  # ONLINE | OFFLINE | HYBRID

    city: str
    venue: Optional[str]

    start_date: datetime
    end_date: datetime

    banner_url: Optional[str]
    status: str  # DRAFT | PUBLISHED | CANCELLED

    created_at: datetime = Field(default_factory=datetime.utcnow)
