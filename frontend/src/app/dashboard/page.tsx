"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Feather, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useStories } from "@/hooks/useStories";
import { Navbar } from "@/components/layout/Navbar";
import { StoryCard } from "@/components/story/StoryCard";
import { Spinner } from "@/components/ui/Spinner";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { stories, loading, deleteStory } = useStories();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    try {
      await deleteStory(id);
      toast.success("Story deleted");
    } catch {
      toast.error("Failed to delete story");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-parchment-100">Your Library</h1>
            <p className="text-sm text-parchment-400 font-sans mt-1">{stories.length} {stories.length === 1 ? "story" : "stories"}</p>
          </div>
          <Link
            href="/forge"
            className="inline-flex items-center gap-2 bg-gold-500 text-ink-900 hover:bg-gold-400 px-5 py-2.5 rounded-sm font-sans font-medium text-sm transition-all shadow-[0_0_20px_rgba(201,168,76,0.2)]"
          >
            <Plus size={15} />
            New story
          </Link>
        </div>

        {/* Stories grid */}
        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <BookOpen size={48} className="text-ink-600" />
            <div>
              <p className="font-serif text-xl text-parchment-300">No stories yet</p>
              <p className="text-sm text-parchment-400 font-sans mt-1">Every legend starts with a single word.</p>
            </div>
            <Link
              href="/forge"
              className="inline-flex items-center gap-2 bg-gold-500 text-ink-900 hover:bg-gold-400 px-6 py-3 rounded-sm font-sans font-medium transition-all"
            >
              <Feather size={15} />
              Forge your first story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stories.map((s) => (
              <StoryCard key={s.id} story={s} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
