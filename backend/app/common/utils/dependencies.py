from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

def get_current_user(required_role=None):
    async def _get_user(token: str = Depends(oauth2_scheme)):
        from app.core.database import db
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            role = payload.get("role")
            if required_role and role != required_role:
                raise HTTPException(status_code=403, detail="Forbidden")
            user = await db.users.find_one({"_id": user_id})
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            return user
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    return _get_user
