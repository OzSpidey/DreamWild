"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Feather, Library, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-ink-700 bg-ink-900/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <Feather size={20} className="text-gold-500 group-hover:animate-quill-pulse" />
          <span className="font-serif text-lg font-semibold tracking-wide text-parchment-100">
            Dream<span className="text-gold-500">Wild</span>
          </span>
        </Link>

        {/* Nav links */}
        {!loading && user && (
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-parchment-300 hover:text-parchment-100 rounded-sm hover:bg-ink-800 transition-colors"
            >
              <Library size={15} />
              <span>Library</span>
            </Link>
            <Link
              href="/forge"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gold-400 hover:text-gold-300 rounded-sm hover:bg-ink-800 transition-colors"
            >
              <BookOpen size={15} />
              <span>New Story</span>
            </Link>

            {/* User menu */}
            <div className="relative ml-2">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-parchment-400 hover:text-parchment-100 rounded-sm hover:bg-ink-800 transition-colors"
              >
                <User size={16} />
                <span className="max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-ink-800 border border-ink-600 rounded-sm shadow-xl">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-parchment-300 hover:text-parchment-100 hover:bg-ink-700"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !user && (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-parchment-400 hover:text-parchment-100 px-3 py-1.5 transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-gold-500 text-ink-900 hover:bg-gold-400 px-4 py-1.5 rounded-sm font-medium transition-colors"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
