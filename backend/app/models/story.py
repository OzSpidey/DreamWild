from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Genre(str, Enum):
    fantasy = "fantasy"
    scifi = "sci-fi"
    mystery = "mystery"
    romance = "romance"
    horror = "horror"
    adventure = "adventure"
    thriller = "thriller"
    fairy_tale = "fairy-tale"


class Tone(str, Enum):
    whimsical = "whimsical"
    dark = "dark"
    epic = "epic"
    humorous = "humorous"
    suspenseful = "suspenseful"
    romantic = "romantic"


class ReadingAge(str, Enum):
    children = "children"
    middle_grade = "middle-grade"
    young_adult = "young-adult"
    adult = "adult"


class ImageStyle(str, Enum):
    illustrated = "illustrated"
    realistic = "realistic"
    fantasy_art = "fantasy-art"
    noir = "noir"
    watercolor = "watercolor"


class StoryCreateRequest(BaseModel):
    genre: Genre
    tone: Tone
    reading_age: ReadingAge
    protagonist: str = Field(..., min_length=2, max_length=200)
    setting: str = Field(..., min_length=2, max_length=300)
    chapter_count: int = Field(default=5, ge=3, le=10)
    image_style: ImageStyle = ImageStyle.illustrated


class StoryBible(BaseModel):
    protagonist_description: str = ""
    world_rules: str = ""
    established_characters: str = ""
    plot_threads: str = ""
    tone_voice: str = ""


class ChapterOut(BaseModel):
    id: str
    story_id: str
    chapter_number: int
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    status: str


class StoryOut(BaseModel):
    id: str
    user_id: str
    title: str
    genre: str
    tone: str
    reading_age: str
    protagonist: str
    setting: str
    chapter_count: int
    status: str
    cover_image_url: Optional[str] = None
    created_at: str
    chapters: list[ChapterOut] = []
