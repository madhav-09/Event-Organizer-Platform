from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
import asyncio
import logging
import io

from app.common.utils.dependencies import get_current_user
from app.common.utils.email import send_email
from app.core.database import db
from app.modules.certificates.service import (
    generate_certificate_for_user,
    ROLE_TO_TYPE,
    _generate_pdf,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/certificates", tags=["certificates"])


# ─── Helper ──────────────────────────────────────────────────────────────────

def _str_id(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


# ─── Request Models ───────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    event_id: str
    role: str  # ATTENDEE | SPEAKER | VOLUNTEER | VENDOR


class SendRequest(BaseModel):
    event_id: str
    role: Optional[str] = None  # None = send all roles


class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    html_template: str


# ─── Default templates ────────────────────────────────────────────────────────

DEFAULT_TEMPLATES = [
    {
        "name": "Participation Certificate",
        "description": "For event attendees",
        "html_template": "<h1>{{name}}</h1><p>attended {{event_name}} on {{event_date}} as {{role}}</p>",
    },
    {
        "name": "Speaker Certificate",
        "description": "For event speakers",
        "html_template": "<h1>{{name}}</h1><p>spoke at {{event_name}} on {{event_date}}</p>",
    },
    {
        "name": "Volunteer Appreciation Certificate",
        "description": "For volunteers",
        "html_template": "<h1>{{name}}</h1><p>volunteered at {{event_name}} on {{event_date}}</p>",
    },
    {
        "name": "Vendor Appreciation Certificate",
        "description": "For vendors",
        "html_template": "<h1>{{name}}</h1><p>participated as a vendor at {{event_name}} on {{event_date}}</p>",
    },
]


# ─── TEMPLATES ────────────────────────────────────────────────────────────────

@router.get("/templates")
async def list_templates(
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    templates = await db.certificate_templates.find().to_list(length=100)
    if not templates:
        # Seed defaults on first call
        for t in DEFAULT_TEMPLATES:
            t["created_at"] = datetime.utcnow()
            await db.certificate_templates.insert_one(t)
        templates = await db.certificate_templates.find().to_list(length=100)
    return [_str_id(t) for t in templates]


@router.post("/templates")
async def create_template(
    payload: TemplateCreate,
    current_user=Depends(get_current_user(required_role="ORGANIZER"))
):
    doc = payload.model_dump()
    doc["created_at"] = datetime.utcnow()
    result = await db.certificate_templates.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Template created"}


# ─── GENERATE ─────────────────────────────────────────────────────────────────

@router.post("/generate")
async def generate_certificates(
    request: GenerateRequest,
    current_user=Depends(get_current_user(required_role="ORGANIZER")),
):
    """
    Generate PDF certificates for all confirmed attendees with the given role.
    Skips participants who already have a cert for this event+role.
    """
    try:
        event_oid = ObjectId(request.event_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid event_id")

    # Verify event belongs to organizer — handle both ObjectId and string storage
    event = await db.events.find_one({
        "_id": event_oid,
        "$or": [
            {"organizer_id": current_user["_id"]},
            {"organizer_id": str(current_user["_id"])},
        ]
    })
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or not yours")

    event_name = event["title"]
    event_date = event["start_date"].strftime("%d %B %Y") if isinstance(event.get("start_date"), datetime) else str(event.get("start_date", ""))

    role = request.role.upper()
    if role not in ROLE_TO_TYPE:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Choose from: {', '.join(ROLE_TO_TYPE.keys())}"
        )

    cert_type = ROLE_TO_TYPE[role]

    # ── Find participants ──────────────────────────────────────────────────────
    # ATTENDEE: confirmed bookings
    # SPEAKER: speakers added to this event via /speakers endpoint
    # VOLUNTEER / VENDOR: entries in `event_participants` collection
    participants = []

    if role == "ATTENDEE":
        bookings_cursor = db.bookings.find({
            "event_id": str(request.event_id),
            "status": "CONFIRMED"
        })
        async for booking in bookings_cursor:
            uid = booking.get("user_id")
            # user_id can be ObjectId or str depending on when booking was made
            if uid is None:
                continue
            user = await db.users.find_one({
                "$or": [
                    {"_id": uid},
                    {"_id": ObjectId(str(uid)) if not isinstance(uid, ObjectId) else uid},
                ]
            })
            if user:
                participants.append({
                    "user_id": str(user["_id"]),
                    "name": user.get("full_name") or user.get("name", "Attendee"),
                    "email": user.get("email", ""),
                })
    elif role == "SPEAKER":
        speakers_cursor = db.speakers.find({"event_id": str(request.event_id)})
        async for speaker in speakers_cursor:
            participants.append({
                "user_id": str(speaker.get("_id")),
                "name": speaker.get("name", "Speaker"),
                "email": speaker.get("email", ""),
            })
    else:
        # VOLUNTEER / VENDOR — from generic event_participants collection
        p_cursor = db.event_participants.find({
            "event_id": str(request.event_id),
            "role": role
        })
        async for p in p_cursor:
            participants.append({
                "user_id": str(p.get("user_id", p["_id"])),
                "name": p.get("name", "Participant"),
                "email": p.get("email", ""),
            })

    if not participants:
        return {"generated": 0, "message": f"No {role.lower()}s found for this event"}

    # ── Generate certs concurrently ───────────────────────────────────────────
    generated = 0
    skipped = 0

    async def _gen_one(p: dict):
        nonlocal generated, skipped
        # Check for existing cert
        existing = await db.certificates.find_one({
            "event_id": str(request.event_id),
            "user_id": p["user_id"],
            "role": role,
        })
        if existing:
            skipped += 1
            return

        cert_id = str(ObjectId())
        try:
            url = await generate_certificate_for_user(
                cert_id=cert_id,
                name=p["name"],
                email=p["email"],
                event_name=event_name,
                event_date=event_date,
                role=role,
            )
        except Exception as e:
            logger.error(f"Failed to generate cert for {p['email']}: {e}")
            return

        await db.certificates.insert_one({
            "_id": ObjectId(cert_id),
            "event_id": str(request.event_id),
            "user_id": p["user_id"],
            "name": p["name"],
            "email": p["email"],
            "role": role,
            "certificate_type": cert_type,
            "certificate_url": url,
            "status": "generated",
            "created_at": datetime.utcnow(),
        })
        generated += 1

    await asyncio.gather(*[_gen_one(p) for p in participants])

    return {
        "generated": generated,
        "skipped": skipped,
        "message": f"Generated {generated} certificate(s). Skipped {skipped} (already exist)."
    }


# ─── SEND ─────────────────────────────────────────────────────────────────────

async def _send_cert_email(cert: dict, event_name: str):
    """Send a certificate email to a single recipient."""
    try:
        await send_email(
            to_email=cert["email"],
            subject=f"Your Certificate – {event_name}",
            template_name="certificate.html",
            context={
                "name": cert["name"],
                "event_name": event_name,
                "cert_type": cert["certificate_type"],
                "role": cert["role"],
                "certificate_url": cert["certificate_url"],
            },
        )
        await db.certificates.update_one(
            {"_id": cert["_id"]},
            {"$set": {"status": "sent"}}
        )
    except Exception as e:
        logger.error(f"Failed to send cert to {cert['email']}: {e}")


@router.post("/send")
async def send_certificates(
    request: SendRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user(required_role="ORGANIZER")),
):
    try:
        event_oid = ObjectId(request.event_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid event_id")

    event = await db.events.find_one({"_id": event_oid, "organizer_id": current_user["_id"]})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or not yours")

    query: dict = {"event_id": str(request.event_id), "status": "generated"}
    if request.role:
        query["role"] = request.role.upper()

    certs = await db.certificates.find(query).to_list(length=5000)
    if not certs:
        return {"sent": 0, "message": "No unsent certificates found"}

    event_name = event["title"]
    for cert in certs:
        background_tasks.add_task(_send_cert_email, cert, event_name)

    return {
        "sent": len(certs),
        "message": f"Sending {len(certs)} certificate(s) in background"
    }


# ─── LIST (Organizer) ─────────────────────────────────────────────────────────

@router.get("/event/{event_id}")
async def get_event_certificates(
    event_id: str,
    role: Optional[str] = None,
    current_user=Depends(get_current_user(required_role="ORGANIZER")),
):
    try:
        event_oid = ObjectId(event_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid event_id")

    event = await db.events.find_one({"_id": event_oid, "organizer_id": current_user["_id"]})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or not yours")

    query: dict = {"event_id": event_id}
    if role:
        query["role"] = role.upper()

    certs = await db.certificates.find(query).sort("created_at", -1).to_list(length=5000)
    return [_str_id(c) for c in certs]


# ─── MY CERTIFICATES (User) ───────────────────────────────────────────────────

@router.get("/my")
async def get_my_certificates(
    current_user=Depends(get_current_user()),
):
    user_id = str(current_user["_id"])
    certs = await db.certificates.find({"user_id": user_id}).sort("created_at", -1).to_list(length=200)

    # Enrich with event details
    result = []
    for cert in certs:
        cert = _str_id(cert)
        event = await db.events.find_one({"_id": ObjectId(cert["event_id"])})
        cert["event_name"] = event["title"] if event else "Unknown Event"
        cert["event_date"] = event["start_date"].strftime("%d %B %Y") if event and isinstance(event.get("start_date"), datetime) else ""
        result.append(cert)

    return result


# ─── VERIFY (Public) ──────────────────────────────────────────────────────────

@router.get("/verify/{cert_id}")
async def verify_certificate(cert_id: str):
    try:
        oid = ObjectId(cert_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid certificate ID")

    cert = await db.certificates.find_one({"_id": oid})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    event = await db.events.find_one({"_id": ObjectId(cert["event_id"])})
    cert["event_name"] = event["title"] if event else "Unknown Event"
    cert["event_date"] = event["start_date"].strftime("%d %B %Y") if event and isinstance(event.get("start_date"), datetime) else ""

    return _str_id(cert)


# ─── DIRECT DOWNLOAD (Fallback) ────────────────────────────────────────────────

@router.get("/download/{cert_id}")
async def download_certificate(
    cert_id: str,
    current_user=Depends(get_current_user()),
):
    """
    Regenerates the certificate PDF on-the-fly and streams it as an attachment.
    Completely bypasses Cloudinary — works regardless of cloud config.
    """
    import os

    try:
        oid = ObjectId(cert_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid certificate ID")

    cert = await db.certificates.find_one({"_id": oid})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    # Owner or any organizer can download
    if str(cert["user_id"]) != str(current_user["_id"]) and current_user.get("role") != "ORGANIZER":
        raise HTTPException(status_code=403, detail="Not your certificate")

    event = await db.events.find_one({"_id": ObjectId(cert["event_id"])})
    event_name = event["title"] if event else "Event"
    event_date = (
        event["start_date"].strftime("%d %B %Y")
        if event and isinstance(event.get("start_date"), datetime)
        else ""
    )
    frontend_base = os.getenv("FRONTEND_URL", "http://localhost:5173")

    loop = asyncio.get_running_loop()
    pdf_bytes = await loop.run_in_executor(
        None,
        _generate_pdf,
        cert["name"],
        event_name,
        event_date,
        cert["role"],
        cert["certificate_type"],
        str(cert["_id"]),
        frontend_base,
    )

    safe_name = cert["name"].replace(" ", "_")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="Certificate_{safe_name}.pdf"'
        },
    )
