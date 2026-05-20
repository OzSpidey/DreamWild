"use client";
import { useEffect, useRef } from "react";
import { parseSSEStream } from "@/lib/api/sse";
import { useStoryStore } from "@/store/storyStore";

export function useStoryStream(stream: ReadableStream | null) {
  const store = useStoryStore();
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!stream) return;
    store.setStreamStatus("streaming");

    cancelRef.current = parseSSEStream(
      stream,
      {
        story_started: (d) => {
          store.setStoryId(d.story_id as string);
          store.setStoryTitle(d.title as string);
        },
        chapter_started: (d) => store.startChapter(d.chapter_number as number, d.title as string),
        chapter_token:   (d) => store.appendToken(d.chapter_number as number, d.token as string),
        chapter_text_complete: (d) => store.completeChapterText(d.chapter_number as number),
        chapter_image_ready:   (d) => store.setChapterImage(d.chapter_number as number, d.url as string),
        chapter_audio_ready:   (d) => store.setChapterAudio(d.chapter_number as number, d.url as string),
        chapter_complete:      (d) => store.completeChapter(d.chapter_number as number),
        story_complete: () => store.setStreamStatus("complete"),
        error: (d) => store.setError(d.message as string),
      },
      () => {
        if (store.streamStatus === "streaming") store.setStreamStatus("complete");
      }
    );

    return () => cancelRef.current?.();
  }, [stream]); // eslint-disable-line react-hooks/exhaustive-deps
}
