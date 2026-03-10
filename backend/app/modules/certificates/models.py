from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CertificateTemplate(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: Optional[str] = ""
    # Jinja2 HTML with placeholders: {{name}}, {{event_name}}, {{event_date}}, {{role}}
    html_template: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Certificate(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    event_id: str
    user_id: str
    name: str
    email: str
    role: str                   # ATTENDEE | SPEAKER | VOLUNTEER | VENDOR
    certificate_type: str       # e.g. "Participation Certificate"
    certificate_url: str        # Cloudinary URL
    qr_code_url: Optional[str] = None
    status: str = "generated"   # generated | sent
    created_at: datetime = Field(default_factory=datetime.utcnow)
