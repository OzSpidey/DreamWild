import asyncio
import json
import logging
from typing import AsyncIterator

from supabase import Client

from app.models.story import StoryBible, StoryCreateRequest
from app.services import claude_service, fal_service, tts_service
from app.services.storage_service import upload_from_url, upload_bytes

logger = logging.getLogger(__name__)


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def run_story_pipeline(
    db: Client,
    story_id: str,
    user_id: str,
    req: StoryCreateRequest,
) -> AsyncIterator[str]:
    try:
        # 1. Generate outline
        yield _sse("status", {"message": "Crafting your story outline…"})
        outline = await claude_service.generate_chapter_outline(
            genre=req.genre,
            tone=req.tone,
            reading_age=req.reading_age,
            protagonist=req.protagonist,
            setting=req.setting,
            chapter_count=req.chapter_count,
        )

        db.table("stories").update({"title": outline["title"], "status": "generating"}).eq("id", story_id).execute()
        yield _sse("story_started", {"story_id": story_id, "title": outline["title"]})

        story_bible = StoryBible()
        previous_ending = ""

        for ch in outline["chapters"]:
            chapter_num = ch["number"]
            chapter_title = ch["title"]
            chapter_summary = ch["summary"]
            image_prompt = ch.get("image_prompt", chapter_summary)

            # Insert pending chapter row
            ch_row = db.table("chapters").insert({
                "story_id": story_id,
                "chapter_number": chapter_num,
                "title": chapter_title,
                "status": "generating",
            }).execute().data[0]
            chapter_id = ch_row["id"]

            yield _sse("chapter_started", {"chapter_number": chapter_num, "title": chapter_title})

            # Stream chapter text from Claude
            full_content = ""
            async for token in claude_service.stream_chapter(
                chapter_number=chapter_num,
                chapter_title=chapter_title,
                chapter_summary=chapter_summary,
                story_title=outline["title"],
                genre=req.genre,
                tone=req.tone,
                reading_age=req.reading_age,
                protagonist=req.protagonist,
                setting=req.setting,
                story_bible=story_bible,
                previous_ending=previous_ending,
            ):
                full_content += token
                yield _sse("chapter_token", {"chapter_number": chapter_num, "token": token})

            previous_ending = full_content[-600:]

            # Persist text immediately
            db.table("chapters").update({"content": full_content}).eq("id", chapter_id).execute()
            yield _sse("chapter_text_complete", {"chapter_number": chapter_num})

            # Image + audio in parallel
            image_url = None
            audio_url = None

            async def _gen_image():
                nonlocal image_url
                try:
                    raw_url = await fal_service.generate_chapter_image(image_prompt, req.image_style)
                    image_url = await upload_from_url(
                        db, "chapter-images",
                        f"{story_id}/{chapter_num}.jpg",
                        raw_url, "image/jpeg",
                    )
                except Exception as e:
                    logger.warning(f"Image failed ch{chapter_num}: {e}")

            async def _gen_audio():
                nonlocal audio_url
                try:
                    audio_bytes = await tts_service.generate_chapter_audio(full_content, req.reading_age)
                    audio_url = upload_bytes(
                        db, "chapter-audio",
                        f"{story_id}/{chapter_num}.mp3",
                        audio_bytes, "audio/mpeg",
                    )
                except Exception as e:
                    logger.warning(f"Audio failed ch{chapter_num}: {e}")

            await asyncio.gather(_gen_image(), _gen_audio())

            db.table("chapters").update({
                "image_url": image_url,
                "audio_url": audio_url,
                "status": "complete",
            }).eq("id", chapter_id).execute()

            if image_url:
                yield _sse("chapter_image_ready", {"chapter_number": chapter_num, "url": image_url})
            if audio_url:
                yield _sse("chapter_audio_ready", {"chapter_number": chapter_num, "url": audio_url})

            yield _sse("chapter_complete", {"chapter_number": chapter_num})

            # Update story bible for continuity
            story_bible = await claude_service.update_story_bible(story_bible, full_content, chapter_num)
            db.table("stories").update({"story_bible": story_bible.model_dump()}).eq("id", story_id).execute()

            # Use first chapter image as cover
            if chapter_num == 1 and image_url:
                db.table("stories").update({"cover_image_url": image_url}).eq("id", story_id).execute()

        db.table("stories").update({"status": "complete"}).eq("id", story_id).execute()
        yield _sse("story_complete", {"story_id": story_id})

    except Exception as e:
        logger.error(f"Pipeline error story={story_id}: {e}", exc_info=True)
        db.table("stories").update({"status": "error"}).eq("id", story_id).execute()
        yield _sse("error", {"message": str(e)})
