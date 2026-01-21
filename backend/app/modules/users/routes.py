from fastapi import APIRouter, HTTPException, Depends, Body, Query
from typing import List, Optional
from bson import ObjectId

from app.core.database import db
from app.modules.users.models import User
from app.common.utils.security import hash_password, verify_password
from app.common.utils.jwt import create_access_token
from app.common.utils.dependencies import get_current_user
from fastapi.security import OAuth2PasswordRequestForm

from app.modules.events.schemas import EventOut

import os

router = APIRouter(prefix="/users", tags=["users"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


# ================= REGISTER =================
@router.post("/register")
async def register_user(user: User):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user.password = hash_password(user.password)
    result = await db.users.insert_one(user.dict(by_alias=True))

    return {
        "message": "User registered successfully",
        "user": {
            "id": str(result.inserted_id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


# ================= LOGIN =================
@router.post("/login")
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    email = form_data.username
    password = form_data.password

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        {"sub": str(user["_id"]), "role": user["role"]}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        },
    }



# ================= REFRESH =================
@router.post("/refresh")
async def refresh_token(refresh_token: str = Body(...)):
    from jose import jwt, JWTError

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")

        new_access = create_access_token({"sub": user_id, "role": role})
        return {"access_token": new_access, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ================= MY BOOKINGS =================
@router.get("/me/bookings")
async def my_bookings(user=Depends(get_current_user())):
    cursor = db.bookings.find({"user_id": ObjectId(user["_id"])})
    bookings = []

    async for b in cursor:
        ticket = await db.tickets.find_one(
            {"_id": ObjectId(b["ticket_id"])},
            {"title": 1, "price": 1},
        )

        event = await db.events.find_one(
            {"_id": ObjectId(b["event_id"])},
            {"title": 1, "start_date": 1, "city": 1},
        )

        bookings.append(
            {
                "booking_id": str(b["_id"]),
                "event": {
                    "id": str(event["_id"]),
                    "title": event["title"],
                    "date": event["start_date"],
                    "location": event["city"],
                },
                "ticket": {
                    "id": str(ticket["_id"]),
                    "title": ticket["title"],
                    "price": ticket["price"],
                },
                "quantity": b["quantity"],
                "total_amount": b["total_amount"],
                "status": b["status"],
                "created_at": b["created_at"],
            }
        )

    return bookings


# ================= SEARCH EVENTS =================
@router.get("/search", response_model=List[EventOut])
async def search_events(
    q: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    venue: Optional[str] = Query(None),
):
    query = {"status": "PUBLISHED"}

    if q and q.strip():
        regex = {"$regex": q.strip(), "$options": "i"}
        query["$or"] = [
            {"title": regex},
            {"city": regex},
            {"venue": regex},
        ]

    if city and city.strip():
        query["city"] = {"$regex": city.strip(), "$options": "i"}

    if venue and venue.strip():
        query["venue"] = {"$regex": venue.strip(), "$options": "i"}

    cursor = db.events.find(query)
    events = []

    async for e in cursor:
        e["id"] = str(e["_id"])
        e["organizer_id"] = str(e["organizer_id"])
        del e["_id"]
        events.append(e)

    return events


# ================= SUGGESTIONS =================
@router.get("/suggestions", response_model=List[str])
async def event_suggestions(q: str = Query(..., min_length=1)):
    regex = {"$regex": q, "$options": "i"}

    cursor = db.events.find(
        {
            "status": "PUBLISHED",
            "$or": [
                {"title": regex},
                {"city": regex},
                {"venue": regex},
            ],
        },
        {"_id": 0, "title": 1, "city": 1, "venue": 1},
    ).limit(8)

    suggestions = set()

    async for doc in cursor:
        suggestions.update(
            filter(None, [doc.get("title"), doc.get("city"), doc.get("venue")])
        )

    return list(suggestions)
