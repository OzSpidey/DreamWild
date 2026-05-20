"use client";
import { clsx } from "clsx";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import type { ChapterStatus } from "@/types/story";

interface NavChapter {
  chapter_number: number;
  title: string | null;
  status: ChapterStatus;
}

interface Props {
  chapters: NavChapter[];
  activeChapter: number;
  onSelect: (n: number) => void;
}

export function ChapterNav({ chapters, activeChapter, onSelect }: Props) {
  return (
    <nav className="flex flex-col gap-1">
      <p className="text-xs font-sans uppercase tracking-widest text-parchment-400 mb-2 px-2">
        Chapters
      </p>
      {chapters.map((ch) => (
        <button
          key={ch.chapter_number}
          onClick={() => onSelect(ch.chapter_number)}
          className={clsx(
            "flex items-start gap-2.5 px-2 py-2 rounded-sm text-left transition-colors group",
            activeChapter === ch.chapter_number
              ? "bg-gold-600/15 text-parchment-100"
              : "text-parchment-400 hover:bg-ink-800 hover:text-parchment-200"
          )}
        >
          <span className="mt-0.5 flex-shrink-0">
            {ch.status === "complete"   ? <CheckCircle size={13} className="text-gold-600" /> :
             ch.status === "generating" ? <Loader2 size={13} className="animate-spin text-gold-500" /> :
                                          <Circle size={13} className="text-ink-600" />}
          </span>
          <span className="text-xs font-sans leading-snug">
            <span className="text-gold-700 mr-1">{ch.chapter_number}.</span>
            {ch.title ?? "…"}
          </span>
        </button>
      ))}
    </nav>
  );
}
