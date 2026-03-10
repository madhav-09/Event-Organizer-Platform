from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class AgendaItem(BaseModel):
    id: str = Field(alias="_id")
    title: str
    startTime: str
    endTime: str
    speaker: Optional[str] = ""
    room: Optional[str] = ""
    description: Optional[str] = ""
    type: str  # TALK | WORKSHOP | BREAK | PANEL


# ================= REQUEST SCHEMAS =================

class EventCreate(BaseModel):
    title: str
    description: Optional[str]
    category: str
    tags: Optional[List[str]] = None
    type: str  # ONLINE | OFFLINE | HYBRID

    city: str
    venue: Optional[str]

    start_date: datetime
    end_date: datetime

    banner_url: Optional[str] = None
    status: str  # DRAFT | PUBLISHED
    agenda: Optional[List[AgendaItem]] = []

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def parse_datetime(cls, value):
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                if len(value) == 16:  # YYYY-MM-DDTHH:MM
                    value += ":00"
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
        return value


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    type: Optional[str] = None

    city: Optional[str] = None
    venue: Optional[str] = None

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    banner_url: Optional[str] = None
    status: Optional[str] = None
    agenda: Optional[List[AgendaItem]] = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def parse_datetime(cls, value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            # Handle both ISO format and datetime-local format (YYYY-MM-DDTHH:MM)
            try:
                # Try parsing as ISO format first
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                # Try adding seconds if missing (datetime-local format)
                if len(value) == 16:  # YYYY-MM-DDTHH:MM
                    value += ":00"
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
        return value


# ================= RESPONSE SCHEMA =================

class EventOut(BaseModel):
    id: str
    organizer_id: str

    title: str
    description: Optional[str]
    category: str
    tags: Optional[List[str]] = None
    type: str

    city: str
    venue: Optional[str]

    start_date: datetime
    end_date: datetime

    banner_url: Optional[str]
    status: str
    agenda: Optional[List[AgendaItem]] = []
    created_at: datetime


class EventTicketOut(BaseModel):
    id: str
    event_id: str
    title: str
    price: float
    quantity: int
    sold: int = 0
    created_at: Optional[datetime] = None


class EventWithTicketsOut(EventOut):
    tickets: List[EventTicketOut] = Field(default_factory=list)
