"use client";
import { Feather } from "lucide-react";

interface Props { tokenBuffer: string; chapterTitle: string; chapterNumber: number; }

export function GeneratingIndicator({ tokenBuffer, chapterTitle, chapterNumber }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Feather size={18} className="text-gold-500 animate-quill-pulse flex-shrink-0" />
        <div>
          <p className="text-xs font-sans uppercase tracking-widest text-parchment-400">
            Chapter {chapterNumber} — Writing
          </p>
          <h3 className="font-serif text-lg text-parchment-100">{chapterTitle}</h3>
        </div>
      </div>
      {tokenBuffer && (
        <div className="prose-story cursor-blink">{tokenBuffer}</div>
      )}
      {!tokenBuffer && (
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gold-600 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
