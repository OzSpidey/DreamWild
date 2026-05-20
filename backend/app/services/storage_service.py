import httpx
from supabase import Client


async def upload_from_url(db: Client, bucket: str, path: str, url: str, content_type: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.content

    db.storage.from_(bucket).upload(
        path, data, {"content-type": content_type, "upsert": "true"}
    )
    return db.storage.from_(bucket).get_public_url(path)


def upload_bytes(db: Client, bucket: str, path: str, data: bytes, content_type: str) -> str:
    db.storage.from_(bucket).upload(
        path, data, {"content-type": content_type, "upsert": "true"}
    )
    return db.storage.from_(bucket).get_public_url(path)


def delete_story_assets(db: Client, story_id: str) -> None:
    for bucket in ("chapter-images", "chapter-audio"):
        try:
            files = db.storage.from_(bucket).list(story_id)
            if files:
                paths = [f"{story_id}/{f['name']}" for f in files]
                db.storage.from_(bucket).remove(paths)
        except Exception:
            pass
