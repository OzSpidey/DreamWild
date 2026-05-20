from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.models.user import UpdateProfileRequest

router = APIRouter()


@router.get("/me")
async def get_profile(user: dict = Depends(get_current_user), db: Client = Depends(get_supabase)):
    res = db.table("profiles").select("*").eq("id", user["sub"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return res.data[0]


@router.patch("/me")
async def update_profile(
    req: UpdateProfileRequest,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    updates = req.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = db.table("profiles").update(updates).eq("id", user["sub"]).execute()
    return res.data[0]
