from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from bson import ObjectId
from bson.errors import InvalidId
from typing import Optional
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


def get_current_user(required_role: Optional[str] = None):
    """
    Returns a FastAPI dependency that:
    - Validates the JWT token
    - Fetches the user from the DB (so revoked users / blocked users are caught)
    - Optionally enforces a required role
    """
    async def _get_user(token: str = Depends(oauth2_scheme)):
        from app.core.database import db

        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            raise credentials_exception

        user_id: str | None = payload.get("sub")
        if not user_id:
            raise credentials_exception

        # Reject refresh tokens being used as access tokens
        if payload.get("type") == "refresh":
            raise credentials_exception

        try:
            obj_id = ObjectId(user_id)
        except (InvalidId, Exception):
            raise credentials_exception

        user = await db.users.find_one({"_id": obj_id})
        if not user:
            raise credentials_exception

        # Check if account is blocked (always re-check from DB)
        if user.get("is_blocked"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is blocked. Contact support.",
            )

        # Check role from DB (not from JWT), more secure
        db_role = user.get("role", "USER")
        if required_role and db_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}",
            )

        return user

    return _get_user
