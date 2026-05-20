from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.models.user import SignupRequest, LoginRequest

router = APIRouter()


@router.post("/signup")
async def signup(req: SignupRequest, db: Client = Depends(get_supabase)):
    try:
        res = db.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {"data": {"username": req.username}},
        })
        if res.user is None:
            raise HTTPException(status_code=400, detail="Signup failed")
        return {"user_id": res.user.id, "email": res.user.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(req: LoginRequest, db: Client = Depends(get_supabase)):
    try:
        res = db.auth.sign_in_with_password({"email": req.email, "password": req.password})
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user": {"id": res.user.id, "email": res.user.email},
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["sub"], "email": user.get("email")}
