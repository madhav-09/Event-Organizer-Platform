from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Organizer(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    brand_name: str
    description: str = ""
    kyc_status: str = "PENDING"  # PENDING | APPROVED
    bank_details: Optional[dict] = None
    created_at: datetime = datetime.utcnow()
