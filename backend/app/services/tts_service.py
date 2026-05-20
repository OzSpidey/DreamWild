from openai import AsyncOpenAI
from app.config import settings

_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

_VOICE_MAP = {
    "children":     "shimmer",
    "middle-grade": "alloy",
    "young-adult":  "nova",
    "adult":        "onyx",
}


async def generate_chapter_audio(content: str, reading_age: str) -> bytes:
    voice = _VOICE_MAP.get(reading_age, "onyx")
    resp = await _client.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=content[:4096],
        response_format="mp3",
    )
    return resp.content
