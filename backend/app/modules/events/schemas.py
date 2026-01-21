from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ================= REQUEST SCHEMAS =================

class EventCreate(BaseModel):
    title: str
    description: Optional[str]
    category: str
    type: str  # ONLINE | OFFLINE | HYBRID

    city: str
    venue: Optional[str]

    start_date: datetime
    end_date: datetime

    banner_url: Optional[str]
    status: str  # DRAFT | PUBLISHED


class EventUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    category: Optional[str]
    type: Optional[str]

    city: Optional[str]
    venue: Optional[str]

    start_date: Optional[datetime]
    end_date: Optional[datetime]

    banner_url: Optional[str]
    status: Optional[str]


# ================= RESPONSE SCHEMA =================

class EventOut(BaseModel):
    id: str
    organizer_id: str

    title: str
    description: Optional[str]
    category: str
    type: str

    city: str
    venue: Optional[str]

    start_date: datetime
    end_date: datetime

    banner_url: Optional[str]
    status: str
    created_at: datetime
