from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.modules.users.models import User
from app.common.utils.security import hash_password
from fastapi import Body
from app.common.utils.security import verify_password
from app.common.utils.jwt import create_access_token
import os
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/users", tags=["users"])
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

@router.post("/register")
async def register_user(user: User):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user.password = hash_password(user.password)
    user_dict = user.dict(by_alias=True)
    result = await db.users.insert_one(user_dict)

    return {
        "message": "User registered successfully",
        "user": {
            "id": str(result.inserted_id),
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@router.post("/login")
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    email = form_data.username
    password = form_data.password

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token({
        "sub": str(user["_id"]),
        "role": user["role"]
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }


@router.post("/refresh")
async def refresh_token(refresh_token: str = Body(...)):
    from jose import JWTError, jwt
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        new_access = create_access_token({"sub": user_id, "role": role})
        return {"access_token": new_access, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")