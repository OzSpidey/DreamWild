"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Feather } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;
      toast.success("Account created! Check your email to confirm.");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Feather size={28} className="text-gold-500" />
          <h1 className="font-serif text-2xl text-parchment-100">Create your account</h1>
          <p className="text-sm text-parchment-400 font-sans">Start forging stories today</p>
        </div>
        <form onSubmit={handleSignup} className="bg-ink-800 border border-ink-700 rounded-sm p-6 flex flex-col gap-4">
          <Input id="username" label="Username" placeholder="storyteller42" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input id="email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" placeholder="min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Create account
          </Button>
          <p className="text-center text-xs text-parchment-400 font-sans">
            Already have one?{" "}
            <Link href="/login" className="text-gold-400 hover:text-gold-300">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
