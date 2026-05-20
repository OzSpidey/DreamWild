"use client";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import type { Chapter } from "@/types/story";

interface Props { chapter: Chapter; }

export function ChapterReader({ chapter }: Props) {
  const [showImage, setShowImage] = useState(true);

  return (
    <article className="flex flex-col gap-6 animate-fade-up">
      {/* Chapter header */}
      <div className="border-l-2 border-gold-600 pl-4">
        <p className="text-xs font-sans uppercase tracking-widest text-gold-600 mb-1">
          Chapter {chapter.chapter_number}
        </p>
        <h2 className="font-serif text-2xl md:text-3xl text-parchment-100 font-semibold">
          {chapter.title}
        </h2>
      </div>

      {/* Chapter image */}
      {chapter.image_url && (
        <div className="relative">
          {showImage && (
            <div className="relative w-full h-64 md:h-80 rounded-sm overflow-hidden">
              <Image
                src={chapter.image_url}
                alt={`Chapter ${chapter.chapter_number} illustration`}
                fill
                className="object-cover"
                style={{ filter: "sepia(20%) brightness(0.9)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
            </div>
          )}
          <button
            onClick={() => setShowImage(!showImage)}
            className="mt-2 flex items-center gap-1 text-xs text-parchment-400 hover:text-parchment-200 font-sans transition-colors"
          >
            {showImage ? <><EyeOff size={12} /> Hide image</> : <><Eye size={12} /> Show image</>}
          </button>
        </div>
      )}

      {/* Chapter text */}
      {chapter.content && (
        <div className="prose-story" dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\n\n/g, "</p><p>").replace(/^/, "<p>").replace(/$/, "</p>") }} />
      )}

      {/* Audio player */}
      {chapter.audio_url && (
        <AudioPlayer audioUrl={chapter.audio_url} chapterTitle={chapter.title ?? `Chapter ${chapter.chapter_number}`} />
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1 h-px bg-ink-700" />
        <span className="text-gold-700 text-lg">✦</span>
        <div className="flex-1 h-px bg-ink-700" />
      </div>
    </article>
  );
}
