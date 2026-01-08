from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from app.common.utils.dependencies import get_current_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MAX_BCRYPT_BYTES = 72  # bcrypt limit

def hash_password(password: str) -> str:
    # truncate password to 72 bytes
    password_bytes = password.encode("utf-8")[:MAX_BCRYPT_BYTES]
    return pwd_context.hash(password_bytes)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # truncate plain password to 72 bytes before verifying
    plain_bytes = plain_password.encode("utf-8")[:MAX_BCRYPT_BYTES]
    return pwd_context.verify(plain_bytes, hashed_password)


def get_current_admin(user=Depends(get_current_user)):
    if user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    return user
