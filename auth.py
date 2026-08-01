from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase
import traceback

router = APIRouter(prefix="/api", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    username: str = ""
    country: str = ""
    phone: str = ""
    lang: str = "ar"


@router.post("/register")
async def register(data: RegisterRequest):
    try:
        result = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
        })

        print("SUPABASE RESULT:", result)

        if result.user is None:
            raise HTTPException(status_code=400, detail="Registration failed")

        supabase.table("users").insert({
            "uid": str(result.user.id),
            "name": data.name,
            "username": data.username,
            "country": data.country,
            "phone": data.phone,
            "role": "user",
            "level": "free",
            "lang": data.lang,
        }).execute()

        return {
            "success": True,
            "message": "Account created successfully"
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=repr(e))
