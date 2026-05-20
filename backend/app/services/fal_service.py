import os
import fal_client
from app.config import settings
from app.services.claude_service import get_image_style_modifier

os.environ["FAL_KEY"] = settings.FAL_KEY


async def generate_chapter_image(
    image_prompt: str,
    image_style: str,
) -> str:
    """Calls fal.ai flux/schnell and returns the image URL."""
    style_mod = get_image_style_modifier(image_style)
    full_prompt = f"{image_prompt}, {style_mod}, high quality, no text, no watermark"

    result = await fal_client.run_async(
        "fal-ai/flux/schnell",
        arguments={
            "prompt": full_prompt,
            "image_size": "landscape_16_9",
            "num_inference_steps": 4,
            "num_images": 1,
        },
    )
    return result["images"][0]["url"]
