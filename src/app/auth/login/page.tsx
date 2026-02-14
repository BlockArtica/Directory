"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      loginSchema.parse({ email, password });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const userId = data.session?.user.id;
      if (!userId) throw new Error("Failed to get session");

      // Check user profile for smart redirect
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("id", userId)
        .single();

      if (!profile) {
        // Legacy user with no profile — send to signup to complete
        toast({ title: "Complete your profile", description: "Please select your account type." });
        router.push("/auth/signup?complete=true");
      } else {
        toast({ title: "Welcome back!", description: "Logged in successfully." });
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, err) => {
          acc[err.path[0] as keyof typeof errors] = err.message;
          return acc;
        }, {} as typeof errors);
        setErrors(fieldErrors);
      } else {
        const message = error instanceof Error ? error.message : "Login failed. Please try again.";
        setErrors({ general: message });
        toast({ variant: "destructive", title: "Error", description: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google login failed.";
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-card dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-foreground dark:text-white">Login to Tradies Directory</h2>

        <Button onClick={handleGoogleLogin} variant="outline" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Logging in with Google..." : "Login with Google"}
        </Button>

        <p className="text-center text-sm text-muted-foreground dark:text-gray-400">or</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-muted-foreground dark:text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              disabled={loading}
            />
            {errors.email && <p className="text-sm text-destructive dark:text-red-400 mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password" className="text-muted-foreground dark:text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              disabled={loading}
            />
            {errors.password && <p className="text-sm text-destructive dark:text-red-400 mt-1">{errors.password}</p>}
          </div>
          {errors.general && <p className="text-sm text-destructive dark:text-red-400">{errors.general}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground dark:text-gray-400">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
