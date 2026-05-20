import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "DreamWild — Where Stories Run Wild",
  description: "AI-powered multi-chapter storytelling with real-time streaming, scene illustrations, and audio narration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-900 text-parchment-100">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "#252119", color: "#e8e0c8", border: "1px solid #3d3420" },
          }}
        />
      </body>
    </html>
  );
}
