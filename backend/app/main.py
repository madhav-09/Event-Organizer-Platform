from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import PROJECT_NAME
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.modules.users.routes import router as user_router
from app.modules.organizers.routes import router as organizer_router
from app.modules.events.routes import router as event_router
from app.modules.tickets.routes import router as ticket_router
from app.modules.bookings.routes import router as booking_router
from app.modules.payments.routes import router as payment_router
from app.modules.admin.routes import router as admin_router
from app.modules.payments import webhook
from app.modules.discounts.routes import router as discount_router

import os
import uuid
import shutil

app = FastAPI(title=PROJECT_NAME)

# ================= VALIDATION ERROR HANDLER =================
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error for {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Validation error"},
    )

# ================= CORS =================
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # ✅ Production domain (if you set one later)
    "https://event-organizer-platform.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= ROUTES =================
@app.get("/health")
async def health_check():
    return {"status": "OK"}

from app.modules.reviews.routes import router as surveys_router

app.include_router(user_router)
app.include_router(organizer_router)
app.include_router(event_router)
app.include_router(ticket_router)
app.include_router(booking_router)
app.include_router(payment_router)
app.include_router(admin_router)
app.include_router(webhook.router, prefix="/payments")
app.include_router(discount_router)
app.include_router(surveys_router)

# ================= CLOUDINARY SETUP =================
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# ================= IMAGE UPLOAD =================
@app.post("/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    if not file:
        return {"url": ""}

    try:
        result = cloudinary.uploader.upload(file.file, folder="event_platform")
        return {"url": result.get("secure_url")}
    except Exception as e:
        print("Cloudinary upload failed:", e)
        raise HTTPException(status_code=500, detail="Image upload failed")
