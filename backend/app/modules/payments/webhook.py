import hmac, hashlib
from fastapi import APIRouter, Request, Header, HTTPException
from app.core.database import db
import os

router = APIRouter()

RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")


def verify_signature(payload, signature):
    generated = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(generated, signature)




@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None)
):
    body = await request.body()

    if not verify_signature(body, x_razorpay_signature):
        raise HTTPException(400, "Invalid signature")

    payload = await request.json()

    if payload["event"] == "payment.captured":
        payment = payload["payload"]["payment"]["entity"]

        db.payments.update_one(
            {"order_id": payment["order_id"]},
            {"$set": {
                "payment_id": payment["id"],
                "status": "SUCCESS"
            }}
        )

    return {"status": "ok"}
