"use client";
import { useEffect, useState, useCallback } from "react";
import { listStories, deleteStory as apiDelete } from "@/lib/api/stories";
import type { Story } from "@/types/story";

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setStories(await listStories());
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const deleteStory = async (id: string) => {
    await apiDelete(id);
    setStories((prev) => prev.filter((s) => s.id !== id));
  };

  return { stories, loading, error, refresh: fetch, deleteStory };
}
