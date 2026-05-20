from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.services.storage_service import delete_story_assets

router = APIRouter()


def _owned_story(story_id: str, user_id: str, db: Client) -> dict:
    res = db.table("stories").select("*").eq("id", story_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Story not found")
    story = res.data[0]
    if story["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return story


@router.get("/")
async def list_stories(user: dict = Depends(get_current_user), db: Client = Depends(get_supabase)):
    res = db.table("stories").select("*").eq("user_id", user["sub"]).order("created_at", desc=True).execute()
    return res.data


@router.get("/{story_id}")
async def get_story(
    story_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    story = _owned_story(story_id, user["sub"], db)
    chapters = db.table("chapters").select("*").eq("story_id", story_id).order("chapter_number").execute()
    story["chapters"] = chapters.data
    return story


@router.delete("/{story_id}")
async def delete_story(
    story_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    _owned_story(story_id, user["sub"], db)
    delete_story_assets(db, story_id)
    db.table("stories").delete().eq("id", story_id).execute()
    return {"ok": True}
