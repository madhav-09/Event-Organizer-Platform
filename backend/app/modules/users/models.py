from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    # id: Optional[str] = Field(None, alias="_id")
    name: str
    email: EmailStr
    password: str
    role: str = "USER"  # USER | ORGANIZER | ADMIN
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
