import { createClient } from "@/lib/supabase/client";
import type { Story, StoryCreateParams } from "@/types/story";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

export async function listStories(): Promise<Story[]> {
  const res = await fetch(`${BASE}/api/v1/stories/`, { headers: await authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getStory(id: string): Promise<Story> {
  const res = await fetch(`${BASE}/api/v1/stories/${id}`, { headers: await authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteStory(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/stories/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function startGeneration(params: StoryCreateParams): Promise<{ storyId: string; stream: ReadableStream }> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/v1/generate/`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());

  const storyId = res.headers.get("X-Story-Id") ?? "";
  return { storyId, stream: res.body! };
}
