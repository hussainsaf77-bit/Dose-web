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
