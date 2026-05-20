"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { clsx } from "clsx";

interface Props { audioUrl: string; chapterTitle: string; }

export function AudioPlayer({ audioUrl, chapterTitle }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const speeds = [0.75, 1, 1.25, 1.5];

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime   = () => setProgress(a.currentTime);
    const onLoaded = () => setDuration(a.duration);
    const onEnded  = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onLoaded); a.removeEventListener("ended", onEnded); };
  }, []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Number(e.target.value);
    setProgress(Number(e.target.value));
  };

  const setPlaybackSpeed = (s: number) => {
    const a = audioRef.current;
    if (a) a.playbackRate = s;
    setSpeed(s);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="mt-4 bg-ink-800 border border-ink-700 rounded-sm p-3 flex flex-col gap-2">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        <button onClick={togglePlay} className="flex-shrink-0 w-8 h-8 rounded-full bg-gold-600/20 border border-gold-700/50 text-gold-400 hover:bg-gold-600/30 flex items-center justify-center transition-colors">
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Volume2 size={11} className="text-parchment-400" />
            <span className="text-xs text-parchment-400 font-sans truncate">{chapterTitle}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={seek}
            className="w-full h-1 bg-ink-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-500"
          />
          <div className="flex justify-between text-xs font-sans text-parchment-400">
            <span>{fmt(progress)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
        {/* Speed selector */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setPlaybackSpeed(s)}
              className={clsx("text-xs font-sans px-1.5 rounded-sm transition-colors", speed === s ? "bg-gold-600/30 text-gold-400" : "text-parchment-400 hover:text-parchment-200")}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
