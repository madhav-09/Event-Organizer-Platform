from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class OrganizerApply(BaseModel):
    """Required fields when applying to become an organizer."""
    brand_name: str
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state: str
    pincode: str
    country: str = "India"
    description: str = ""
    website: Optional[str] = None


class Organizer(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    brand_name: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = "India"
    description: str = ""
    website: Optional[str] = None
    kyc_status: str = "PENDING"  # PENDING | APPROVED
    bank_details: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
