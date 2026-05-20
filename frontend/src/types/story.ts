export type StoryStatus = "pending" | "generating" | "complete" | "error";
export type ChapterStatus = "pending" | "generating" | "complete" | "error";

export interface Chapter {
  id: string;
  story_id: string;
  chapter_number: number;
  title: string | null;
  content: string | null;
  image_url: string | null;
  audio_url: string | null;
  status: ChapterStatus;
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  title: string;
  genre: string;
  tone: string;
  reading_age: string;
  protagonist: string;
  setting: string;
  chapter_count: number;
  status: StoryStatus;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  chapters?: Chapter[];
}

export interface StoryCreateParams {
  genre: string;
  tone: string;
  reading_age: string;
  protagonist: string;
  setting: string;
  chapter_count: number;
  image_style: string;
}

export type SSEEventType =
  | "status"
  | "story_started"
  | "chapter_started"
  | "chapter_token"
  | "chapter_text_complete"
  | "chapter_image_ready"
  | "chapter_audio_ready"
  | "chapter_complete"
  | "story_complete"
  | "error";

export interface SSEEvent {
  type: SSEEventType;
  data: Record<string, unknown>;
}
