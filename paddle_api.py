import os
import httpx

PADDLE_API_KEY = os.getenv("PADDLE_API_KEY")
PADDLE_ENV = os.getenv("PADDLE_ENV", "sandbox")

BASE_URL = (
    "https://sandbox-api.paddle.com"
    if PADDLE_ENV == "sandbox"
    else "https://api.paddle.com"
)

HEADERS = {
    "Authorization": f"Bearer {PADDLE_API_KEY}",
    "Content-Type": "application/json",
}

async def create_checkout(price_id: str, uid: str, email: str, plan: str):
    if not PADDLE_API_KEY:
        raise RuntimeError("PADDLE_API_KEY is missing")

    payload = {
        "items": [
            {
                "price_id": price_id,
                "quantity": 1
            }
        ],
        "custom_data": {
            "uid": uid,
            "plan": plan
        }
    }

    # Paddle Checkout can collect the customer's email itself.
    # We keep it in custom data as well for our own reference.
    if email:
        payload["customer"] = {
            "email": email
        }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{BASE_URL}/transactions",
            headers=HEADERS,
            json=payload
        )

    try:
        data = response.json()
    except Exception:
        data = {
            "error": "Invalid response from Paddle",
            "status_code": response.status_code,
            "text": response.text
        }

    if response.status_code >= 400:
        return {
            "success": False,
            "status_code": response.status_code,
            "error": data
        }

    transaction = data.get("data", data)

    checkout = transaction.get("checkout") or {}
    checkout_url = checkout.get("url")

    return {
        "success": True,
        "transaction_id": transaction.get("id"),
        "checkout_url": checkout_url,
        "plan": plan
    }
