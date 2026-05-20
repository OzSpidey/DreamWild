from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.models.story import StoryCreateRequest
from app.services.generation_pipeline import run_story_pipeline

router = APIRouter()


@router.post("/")
async def generate_story(
    req: StoryCreateRequest,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    # Create placeholder story row
    story = db.table("stories").insert({
        "user_id": user["sub"],
        "title": "Generating…",
        "genre": req.genre,
        "tone": req.tone,
        "reading_age": req.reading_age,
        "protagonist": req.protagonist,
        "setting": req.setting,
        "chapter_count": req.chapter_count,
        "status": "pending",
    }).execute().data[0]

    story_id = story["id"]

    async def event_stream():
        async for chunk in run_story_pipeline(db, story_id, user["sub"], req):
            yield chunk

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "X-Story-Id": story_id,
        },
    )
