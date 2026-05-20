"use client";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, Trash2 } from "lucide-react";
import type { Story } from "@/types/story";

interface Props {
  story: Story;
  onDelete?: (id: string) => void;
}

const GENRE_COLORS: Record<string, string> = {
  fantasy:    "text-purple-300 bg-purple-900/30 border-purple-800/50",
  "sci-fi":   "text-cyan-300 bg-cyan-900/30 border-cyan-800/50",
  mystery:    "text-yellow-300 bg-yellow-900/30 border-yellow-800/50",
  romance:    "text-pink-300 bg-pink-900/30 border-pink-800/50",
  horror:     "text-red-300 bg-red-900/30 border-red-800/50",
  adventure:  "text-green-300 bg-green-900/30 border-green-800/50",
  thriller:   "text-orange-300 bg-orange-900/30 border-orange-800/50",
  "fairy-tale": "text-teal-300 bg-teal-900/30 border-teal-800/50",
};

export function StoryCard({ story, onDelete }: Props) {
  const genreClass = GENRE_COLORS[story.genre] ?? "text-parchment-300 bg-ink-700 border-ink-600";
  const date = new Date(story.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="group relative flex flex-col bg-ink-800 border border-ink-700 rounded-sm overflow-hidden hover:border-gold-700 transition-all hover:shadow-[0_0_24px_rgba(201,168,76,0.12)]">
      {/* Cover image */}
      <div className="relative h-44 bg-ink-700 overflow-hidden">
        {story.cover_image_url ? (
          <Image
            src={story.cover_image_url}
            alt={story.title}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <BookOpen size={40} className="text-ink-600" />
          </div>
        )}
        {story.status === "generating" && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900/60">
            <span className="text-xs text-gold-400 font-sans uppercase tracking-widest animate-pulse">
              Writing…
            </span>
          </div>
        )}
        <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-sm border font-sans ${genreClass}`}>
          {story.genre}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="font-serif text-base font-semibold text-parchment-100 leading-snug line-clamp-2">
          {story.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-parchment-400 font-sans mt-auto">
          <span className="flex items-center gap-1">
            <BookOpen size={11} />
            {story.chapter_count} ch.
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {date}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/stories/${story.id}/read`}
            className="flex-1 text-center text-xs font-sans font-medium py-2 bg-gold-600/20 border border-gold-700/50 text-gold-400 hover:bg-gold-600/30 rounded-sm transition-colors"
          >
            {story.status === "complete" ? "Read" : story.status === "generating" ? "Watch it write…" : "Open"}
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(story.id)}
              className="p-2 text-parchment-400 hover:text-red-400 border border-ink-600 hover:border-red-800 rounded-sm transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
