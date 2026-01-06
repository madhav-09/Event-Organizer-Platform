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

app = FastAPI(title=PROJECT_NAME)

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
