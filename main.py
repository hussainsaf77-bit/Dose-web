from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx, os

from auth import router as auth_router
from paddle_api import create_checkout

app = FastAPI()

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")


class ChatRequest(BaseModel):
    message: str
    patient_context: str = ""


class CheckoutRequest(BaseModel):
    price_id: str


@app.get("/")
def root():
    return {"status": "ok", "service": "dose-web-api"}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not ANTHROPIC_KEY:
        raise HTTPException(500, "API key not configured")

    system = f"""أنت صيدلاني طبي متخصص تقدم معلومات دوائية دقيقة باللغة العربية.
ردودك مفيدة وواضحة وتشمل: الجرعة، الاستخدام، الآثار الجانبية، التحذيرات.
دائماً أنهِ بنصيحة مراجعة الطبيب. لا تتجاوز 300 كلمة.
{req.patient_context}"""

    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_KEY,
                "anthropic-version": "2023-06-01"
            },
            json={
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 1000,
                "system": system,
                "messages": [
                    {
                        "role": "user",
                        "content": req.message
                    }
                ]
            }
        )

    data = r.json()
    text = data.get("content", [{}])[0].get(
        "text",
        "عذراً، تعذّر الحصول على رد."
    )

    return {"reply": text}

@app.post("/api/create-checkout")
async def checkout(req: CheckoutRequest):
    data = await create_checkout(req.price_id)
    return data
# updated

@app.get("/test123")
def test123():
    return {"message": "Render is using the latest code"}
