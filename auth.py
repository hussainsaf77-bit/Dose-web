from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api")

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str = ""
    telegram_username: str = ""

@router.post("/register")
async def register(data: RegisterRequest):
    return {
        "success": True,
        "message": "Register endpoint ready"
    }
