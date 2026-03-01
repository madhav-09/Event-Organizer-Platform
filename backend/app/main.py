from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.core.config import PROJECT_NAME

from app.modules.users.routes import router as user_router
from app.modules.organizers.routes import router as organizer_router
from app.modules.events.routes import router as event_router
from app.modules.tickets.routes import router as ticket_router
from app.modules.bookings.routes import router as booking_router
from app.modules.payments.routes import router as payment_router
from app.modules.admin.routes import router as admin_router
from app.modules.payments import webhook

import os
import uuid
import shutil

app = FastAPI(title=PROJECT_NAME)

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        # ✅ Production frontend
        "https://event-organizer-platform-dpjvn09e7-rahuls-projects-8a367406.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= ROUTES =================
@app.get("/health")
async def health_check():
    return {"status": "OK"}

app.include_router(user_router)
app.include_router(organizer_router)
app.include_router(event_router)
app.include_router(ticket_router)
app.include_router(booking_router)
app.include_router(payment_router)
app.include_router(admin_router)
app.include_router(webhook.router, prefix="/payments")

# ================= FILE PATH SETUP (CRITICAL FIX) =================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
EVENT_UPLOAD_DIR = os.path.join(UPLOADS_DIR, "events")

os.makedirs(EVENT_UPLOAD_DIR, exist_ok=True)

# ================= IMAGE SERVING =================
@app.get("/uploads/events/{filename}")
def serve_event_image(filename: str):
    file_path = os.path.join(EVENT_UPLOAD_DIR, filename)

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        file_path,
        headers={
            "Cache-Control": "public, max-age=31536000, immutable"
        }
    )

# ================= IMAGE UPLOAD =================
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file:
        return {"url": ""}

    ext = file.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(EVENT_UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"http://127.0.0.1:8000/uploads/events/{filename}"
    }
