import { create } from "zustand";
import type { Chapter } from "@/types/story";

interface ChapterDraft extends Partial<Chapter> {
  chapter_number: number;
  tokenBuffer: string;
}

interface StoryStreamState {
  storyId: string | null;
  storyTitle: string;
  chapters: ChapterDraft[];
  streamStatus: "idle" | "streaming" | "complete" | "error";
  errorMessage: string;

  setStoryId: (id: string) => void;
  setStoryTitle: (t: string) => void;
  startChapter: (num: number, title: string) => void;
  appendToken: (num: number, token: string) => void;
  completeChapterText: (num: number) => void;
  setChapterImage: (num: number, url: string) => void;
  setChapterAudio: (num: number, url: string) => void;
  completeChapter: (num: number) => void;
  setStreamStatus: (s: StoryStreamState["streamStatus"]) => void;
  setError: (msg: string) => void;
  reset: () => void;
}

export const useStoryStore = create<StoryStreamState>((set) => ({
  storyId: null,
  storyTitle: "",
  chapters: [],
  streamStatus: "idle",
  errorMessage: "",

  setStoryId: (id) => set({ storyId: id }),
  setStoryTitle: (t) => set({ storyTitle: t }),

  startChapter: (num, title) =>
    set((s) => ({
      chapters: [
        ...s.chapters.filter((c) => c.chapter_number !== num),
        { chapter_number: num, title, status: "generating", tokenBuffer: "", content: "" },
      ].sort((a, b) => a.chapter_number - b.chapter_number),
    })),

  appendToken: (num, token) =>
    set((s) => ({
      chapters: s.chapters.map((c) =>
        c.chapter_number === num
          ? { ...c, tokenBuffer: (c.tokenBuffer ?? "") + token, content: (c.content ?? "") + token }
          : c
      ),
    })),

  completeChapterText: (num) =>
    set((s) => ({
      chapters: s.chapters.map((c) =>
        c.chapter_number === num ? { ...c, tokenBuffer: "" } : c
      ),
    })),

  setChapterImage: (num, url) =>
    set((s) => ({
      chapters: s.chapters.map((c) =>
        c.chapter_number === num ? { ...c, image_url: url } : c
      ),
    })),

  setChapterAudio: (num, url) =>
    set((s) => ({
      chapters: s.chapters.map((c) =>
        c.chapter_number === num ? { ...c, audio_url: url } : c
      ),
    })),

  completeChapter: (num) =>
    set((s) => ({
      chapters: s.chapters.map((c) =>
        c.chapter_number === num ? { ...c, status: "complete" } : c
      ),
    })),

  setStreamStatus: (streamStatus) => set({ streamStatus }),
  setError: (errorMessage) => set({ errorMessage, streamStatus: "error" }),
  reset: () => set({ storyId: null, storyTitle: "", chapters: [], streamStatus: "idle", errorMessage: "" }),
}));
