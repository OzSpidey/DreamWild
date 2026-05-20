import type { SSEEventType } from "@/types/story";

type Handler = (data: Record<string, unknown>) => void;
type HandlerMap = Partial<Record<SSEEventType, Handler>>;

export function parseSSEStream(
  stream: ReadableStream<Uint8Array>,
  handlers: HandlerMap,
  onDone?: () => void
): () => void {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let cancelled = false;

  (async () => {
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const raw = line.slice(6).trim();
            try {
              const data = JSON.parse(raw);
              const handler = handlers[currentEvent as SSEEventType];
              handler?.(data);
            } catch {
              // skip malformed
            }
          }
        }
      }
    } finally {
      onDone?.();
    }
  })();

  return () => {
    cancelled = true;
    reader.cancel();
  };
}
