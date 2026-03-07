from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.database import db
from app.common.utils.dependencies import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/discounts", tags=["discounts"])


class DiscountCreate(BaseModel):
    code: str
    type: str          # PERCENTAGE | FIXED_AMOUNT
    value: float
    applies_to_ticket: str = "ALL"   # ticket type name or ALL
    usage_limit: int = 100
    expires_at: Optional[str] = None
    event_id: Optional[str] = None   # None = applies to all events


class DiscountUpdate(BaseModel):
    code: Optional[str] = None
    type: Optional[str] = None          # PERCENTAGE | FIXED_AMOUNT
    value: Optional[float] = None
    applies_to_ticket: Optional[str] = None   # ticket type name or ALL
    usage_limit: Optional[int] = None
    expires_at: Optional[str] = None
    event_id: Optional[str] = None   # None = applies to all events


class ValidateRequest(BaseModel):
    code: str
    event_id: str
    ticket_id: str


@router.post("/validate")
async def validate_discount(body: ValidateRequest, current_user=Depends(get_current_user())):
    """Validate a discount code and return the discount details."""
    code_upper = body.code.strip().upper()
    now = datetime.utcnow()

    doc = await db.discount_codes.find_one({"code": code_upper})
    if not doc:
        raise HTTPException(status_code=404, detail="Invalid discount code")

    # Check expiry
    if doc.get("expires_at") and doc["expires_at"] < now:
        raise HTTPException(status_code=400, detail="This discount code has expired")

    # Check usage limit
    if doc.get("usage_limit") and doc.get("used_count", 0) >= doc["usage_limit"]:
        raise HTTPException(status_code=400, detail="This discount code has reached its usage limit")

    # Check event restriction
    if doc.get("event_id") and str(doc["event_id"]) != body.event_id:
        raise HTTPException(status_code=400, detail="This code is not valid for this event")

    return {
        "code": code_upper,
        "type": doc["type"],          # PERCENTAGE | FIXED_AMOUNT
        "value": doc["value"],
        "applies_to_ticket": doc.get("applies_to_ticket", "ALL"),
        "message": f"Code applied: {doc['value']}{'%' if doc['type'] == 'PERCENTAGE' else '₹'} off"
    }


# ── Organizer CRUD for discount codes ─────────────────────────────────────────

@router.get("/organizer")
async def list_organizer_discounts(current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    docs = await db.discount_codes.find({"organizer_id": str(current_user["_id"])}).to_list(100)
    for d in docs:
        d["_id"] = str(d["_id"])
        if d.get("expires_at"):
            d["expires_at"] = d["expires_at"].isoformat()
        if d.get("event_id"):
            d["event_id"] = str(d["event_id"])
    return docs


@router.post("/organizer")
async def create_discount(body: DiscountCreate, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    existing = await db.discount_codes.find_one({"code": body.code.strip().upper()})
    if existing:
        raise HTTPException(status_code=400, detail="A code with this name already exists")

    expires_at = None
    if body.expires_at:
        try:
            expires_at = datetime.fromisoformat(body.expires_at)
        except ValueError:
            pass

    doc = {
        "organizer_id": str(current_user["_id"]),
        "code": body.code.strip().upper(),
        "type": body.type,
        "value": body.value,
        "applies_to_ticket": body.applies_to_ticket,
        "usage_limit": body.usage_limit,
        "used_count": 0,
        "expires_at": expires_at,
        "event_id": body.event_id,
        "created_at": datetime.utcnow(),
    }
    result = await db.discount_codes.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Discount code created"}


@router.put("/organizer/{code_id}")
async def update_discount(code_id: str, body: DiscountUpdate, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    update_data = body.dict(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    # Handle expires_at conversion
    if "expires_at" in update_data:
        if update_data["expires_at"] is not None:
            try:
                update_data["expires_at"] = datetime.fromisoformat(update_data["expires_at"])
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid expires_at format. Use ISO format.")
        else:
            # Allow setting expires_at to None to remove expiry
            update_data["expires_at"] = None

    # Handle code update (ensure uniqueness if changed)
    if "code" in update_data:
        update_data["code"] = update_data["code"].strip().upper()
        existing = await db.discount_codes.find_one(
            {"code": update_data["code"], "_id": {"$ne": ObjectId(code_id)}}
        )
        if existing:
            raise HTTPException(status_code=400, detail="A code with this name already exists")

    result = await db.discount_codes.update_one(
        {"_id": ObjectId(code_id), "organizer_id": str(current_user["_id"])},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Discount code not found or not owned by organizer")

    return {"message": "Discount code updated successfully"}


@router.delete("/organizer/{code_id}")
async def delete_discount(code_id: str, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    await db.discount_codes.delete_one({"_id": ObjectId(code_id), "organizer_id": str(current_user["_id"])})
    return {"message": "Deleted"}
