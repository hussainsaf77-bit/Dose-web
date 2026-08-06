from fastapi import APIRouter, Request, HTTPException
from database import supabase
from datetime import datetime, timedelta

router = APIRouter(prefix="/api", tags=["Paddle Webhook"])

PLAN_DAYS = {
    "weekly": 7,
    "monthly": 30,
    "quarterly": 120,
    "biannual": 240,
    "annual": 540,
}

@router.post("/paddle/webhook")
async def paddle_webhook(request: Request):
    data = await request.json()

    event = data.get("event_type", "")
    if event not in ["transaction.completed", "subscription.created", "subscription.updated"]:
        return {"status": "ignored"}

    obj = data.get("data", {})
    custom = obj.get("custom_data", {})

    uid = custom.get("uid")
    plan = custom.get("plan")

    if not uid or not plan:
        raise HTTPException(400, "Missing uid or plan")

    days = PLAN_DAYS.get(plan, 30)
    start = datetime.utcnow()
    end = start + timedelta(days=days)

    supabase.table("subscriptions").upsert({
        "uid": uid,
        "plan": plan,
        "status": "active",
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
    }).execute()

    return {"status": "ok"}
