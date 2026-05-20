import json
from typing import AsyncIterator
import anthropic
from app.config import settings
from app.models.story import StoryBible

_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
MODEL = "claude-sonnet-4-6"

_AGE_GUIDE = {
    "children":      "Simple vocabulary, short sentences, imaginative and fun. Ages 6-10.",
    "middle-grade":  "Engaging adventure, age-appropriate stakes. Ages 9-12.",
    "young-adult":   "Relatable emotion, moderate complexity. Ages 13-18.",
    "adult":         "Rich prose, nuanced emotion, complex themes. Adult readers.",
}

_STYLE_GUIDE = {
    "illustrated":  "storybook illustration, vibrant colors, detailed digital art",
    "realistic":    "photorealistic, cinematic, dramatic lighting, 8K",
    "fantasy-art":  "fantasy concept art, painterly, magical glow, ethereal",
    "noir":         "noir, dramatic shadows, high contrast, film noir atmosphere",
    "watercolor":   "soft watercolor painting, dreamy, delicate brushstrokes",
}


async def generate_chapter_outline(
    genre: str,
    tone: str,
    reading_age: str,
    protagonist: str,
    setting: str,
    chapter_count: int,
) -> dict:
    """Returns JSON: {title, chapters:[{number, title, summary, image_prompt}]}"""
    msg = await _client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system="You are a master storyteller. Return only valid JSON with no markdown fences.",
        messages=[{
            "role": "user",
            "content": (
                f"Create a complete {genre} story outline ({tone} tone, {_AGE_GUIDE[reading_age]}).\n"
                f"Protagonist: {protagonist}\nSetting: {setting}\nChapters: {chapter_count}\n\n"
                "Return JSON:\n"
                '{"title":"...","chapters":[{"number":1,"title":"...","summary":"2-3 sentences",'
                '"image_prompt":"vivid 40-word scene description for image generation"}]}'
            ),
        }],
    )
    return json.loads(msg.content[0].text)


async def stream_chapter(
    chapter_number: int,
    chapter_title: str,
    chapter_summary: str,
    story_title: str,
    genre: str,
    tone: str,
    reading_age: str,
    protagonist: str,
    setting: str,
    story_bible: StoryBible,
    previous_ending: str,
) -> AsyncIterator[str]:
    """Yields text tokens for a chapter via Claude streaming."""
    bible_ctx = (
        f"Story Bible:\n"
        f"- Protagonist: {story_bible.protagonist_description}\n"
        f"- World: {story_bible.world_rules}\n"
        f"- Characters: {story_bible.established_characters}\n"
        f"- Plot threads: {story_bible.plot_threads}\n"
        f"- Voice: {story_bible.tone_voice}\n"
    ) if story_bible.protagonist_description else ""

    prev_ctx = f"\nEnd of previous chapter (for continuity):\n{previous_ending}\n" if previous_ending else ""

    prompt = (
        f'Write Chapter {chapter_number}: "{chapter_title}" for the story "{story_title}".\n\n'
        f"Genre: {genre} | Tone: {tone} | Reading level: {_AGE_GUIDE[reading_age]}\n"
        f"Protagonist: {protagonist} | Setting: {setting}\n"
        f"{bible_ctx}{prev_ctx}\n"
        f"What must happen: {chapter_summary}\n\n"
        "Write 700-900 words of compelling prose. No chapter heading. End on a hook. "
        "Write only the chapter text."
    )

    async with _client.messages.stream(
        model=MODEL,
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def update_story_bible(
    current_bible: StoryBible,
    chapter_content: str,
    chapter_number: int,
) -> StoryBible:
    """Reads a finished chapter and returns an updated story bible for continuity."""
    msg = await _client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system="You maintain story continuity. Return only valid JSON.",
        messages=[{
            "role": "user",
            "content": (
                f"Update the story bible after reading Chapter {chapter_number}.\n\n"
                f"Current bible: {current_bible.model_dump_json()}\n\n"
                f"Chapter text (excerpt):\n{chapter_content[:2000]}\n\n"
                "Return updated JSON with same keys: protagonist_description, world_rules, "
                "established_characters, plot_threads, tone_voice."
            ),
        }],
    )
    data = json.loads(msg.content[0].text)
    return StoryBible(**data)


def get_image_style_modifier(image_style: str) -> str:
    return _STYLE_GUIDE.get(image_style, _STYLE_GUIDE["illustrated"])
