"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getStory, startGeneration } from "@/lib/api/stories";
import { parseSSEStream } from "@/lib/api/sse";
import { useStoryStore } from "@/store/storyStore";
import { Navbar } from "@/components/layout/Navbar";
import { ChapterNav } from "@/components/story/ChapterNav";
import { ChapterReader } from "@/components/story/ChapterReader";
import { GeneratingIndicator } from "@/components/story/GeneratingIndicator";
import { Spinner } from "@/components/ui/Spinner";
import type { Chapter } from "@/types/story";

export default function ReadPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const store = useStoryStore();

  const [pageLoading, setPageLoading] = useState(true);
  const [storyTitle, setStoryTitle] = useState("");
  const [completedChapters, setCompletedChapters] = useState<Chapter[]>([]);
  const [activeGenerating, setActiveGenerating] = useState<{ num: number; title: string; buffer: string } | null>(null);
  const [streamDone, setStreamDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const chapterRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !storyId) return;

    const init = async () => {
      try {
        const story = await getStory(storyId);
        setStoryTitle(story.title);

        if (story.status === "complete" && story.chapters) {
          setCompletedChapters(story.chapters as Chapter[]);
          setStreamDone(true);
          setPageLoading(false);
          return;
        }

        if (story.status === "error") {
          setError("Story generation failed. Please try again.");
          setPageLoading(false);
          return;
        }

        // Story is pending/generating — load existing completed chapters and stream the rest
        if (story.chapters) {
          const done = story.chapters.filter((c) => c.status === "complete") as Chapter[];
          setCompletedChapters(done);
        }

        setPageLoading(false);

        // Re-fetch with fresh stream if story is still generating
        // We attach to a new generate call only if pending — otherwise just poll via DB
        if (story.status === "pending") {
          // Story was just created but stream disconnected; re-attach by
          // fetching story status every 2s (fallback polling)
          pollStory();
        } else if (story.status === "generating") {
          pollStory();
        }
      } catch (e) {
        setError(String(e));
        setPageLoading(false);
      }
    };

    init();
    return () => { cancelRef.current?.(); };
  }, [user, storyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const pollStory = () => {
    const interval = setInterval(async () => {
      try {
        const story = await getStory(storyId);
        setStoryTitle(story.title);
        if (story.chapters) {
          const done = story.chapters.filter((c) => c.status === "complete") as Chapter[];
          setCompletedChapters(done);
        }
        if (story.status === "complete") {
          setStreamDone(true);
          setActiveGenerating(null);
          clearInterval(interval);
        }
        if (story.status === "error") {
          setError("Generation failed.");
          clearInterval(interval);
        }
      } catch { clearInterval(interval); }
    }, 2000);
    cancelRef.current = () => clearInterval(interval);
  };

  // If store has an active stream (from forge page navigation), attach to it
  useEffect(() => {
    if (store.storyId !== storyId) return;
    if (store.streamStatus === "idle") return;

    // Mirror store state into local state
    const unsub = useStoryStore.subscribe((state) => {
      setStoryTitle(state.storyTitle);
      const done = state.chapters.filter((c) => c.status === "complete") as unknown as Chapter[];
      setCompletedChapters(done);
      const gen = state.chapters.find((c) => c.status === "generating");
      if (gen) {
        setActiveGenerating({ num: gen.chapter_number, title: gen.title ?? "…", buffer: gen.tokenBuffer ?? "" });
      } else {
        setActiveGenerating(null);
      }
      if (state.streamStatus === "complete") setStreamDone(true);
      if (state.streamStatus === "error") setError(state.errorMessage);
    });

    return unsub;
  }, [store.storyId, storyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollTo = (num: number) => {
    chapterRefs.current[num]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allNavChapters = [
    ...completedChapters.map((c) => ({ chapter_number: c.chapter_number, title: c.title, status: "complete" as const })),
    ...(activeGenerating ? [{ chapter_number: activeGenerating.num, title: activeGenerating.title, status: "generating" as const }] : []),
  ].sort((a, b) => a.chapter_number - b.chapter_number);

  if (authLoading || pageLoading) {
    return <div className="min-h-screen bg-ink-900 flex items-center justify-center"><Spinner size={36} /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertCircle size={40} className="text-red-500" />
          <p className="font-serif text-xl text-parchment-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-52 flex-shrink-0">
          <div className="sticky top-20">
            <div className="mb-4">
              <BookOpen size={16} className="text-gold-600 mb-1" />
              <h2 className="font-serif text-sm text-parchment-200 leading-snug">{storyTitle}</h2>
              {!streamDone && (
                <p className="text-xs text-gold-500 font-sans mt-1 animate-pulse">Writing…</p>
              )}
            </div>
            {allNavChapters.length > 0 && (
              <ChapterNav
                chapters={allNavChapters}
                activeChapter={completedChapters[completedChapters.length - 1]?.chapter_number ?? 1}
                onSelect={scrollTo}
              />
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 max-w-2xl">
          {/* Story title */}
          <div className="mb-10">
            <h1 className="font-serif text-3xl md:text-4xl text-parchment-100 font-semibold">{storyTitle || "Your Story"}</h1>
            {!streamDone && (
              <p className="text-xs font-sans uppercase tracking-widest text-gold-600 mt-2 animate-pulse">
                ✦ Being written now
              </p>
            )}
          </div>

          {/* Completed chapters */}
          {completedChapters.map((ch) => (
            <div key={ch.id} ref={(el) => { chapterRefs.current[ch.chapter_number] = el; }}>
              <ChapterReader chapter={ch} />
            </div>
          ))}

          {/* Currently generating chapter */}
          {activeGenerating && (
            <div ref={(el) => { chapterRefs.current[activeGenerating.num] = el; }} className="py-6">
              <GeneratingIndicator
                chapterNumber={activeGenerating.num}
                chapterTitle={activeGenerating.title}
                tokenBuffer={activeGenerating.buffer}
              />
            </div>
          )}

          {/* Done state */}
          {streamDone && completedChapters.length === 0 && (
            <p className="text-parchment-400 font-sans text-center py-12">Story generation complete.</p>
          )}
        </main>
      </div>
    </div>
  );
}
