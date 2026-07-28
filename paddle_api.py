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


async def create_checkout(price_id: str):
    url = f"{BASE_URL}/transactions"

    payload = {
        "items": [
            {
                "price_id": price_id,
                "quantity": 1
            }
        ]
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            url,
            headers=HEADERS,
            json=payload
        )

    return response.json()
