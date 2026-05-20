"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Feather } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Feather size={28} className="text-gold-500" />
          <h1 className="font-serif text-2xl text-parchment-100">Welcome back</h1>
          <p className="text-sm text-parchment-400 font-sans">Sign in to your DreamWild account</p>
        </div>
        <form onSubmit={handleLogin} className="bg-ink-800 border border-ink-700 rounded-sm p-6 flex flex-col gap-4">
          <Input id="email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Sign in
          </Button>
          <p className="text-center text-xs text-parchment-400 font-sans">
            No account?{" "}
            <Link href="/signup" className="text-gold-400 hover:text-gold-300">Create one</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
