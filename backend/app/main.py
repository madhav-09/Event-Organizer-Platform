from fastapi import FastAPI
from app.core.config import PROJECT_NAME
from app.modules.users.routes import router as user_router
from app.modules.organizers.routes import router as organizer_router
from app.modules.events.routes import router as event_router
from app.modules.tickets.routes import router as ticket_router
from app.modules.bookings.routes import router as booking_router
from app.modules.payments.routes import router as payment_router
from app.modules.admin.routes import router as admin_router
from app.modules.payments import webhook
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File

app = FastAPI(title=PROJECT_NAME)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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


UPLOAD_DIR = "uploads/events"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file:
        return {"url": ""}

    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"http://127.0.0.1:8000/uploads/events/{filename}"
    }

