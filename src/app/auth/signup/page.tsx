"use client"; // Client-side for form interactions

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Input } from "@/components/ui/input"; // Shadcn Input
import { Label } from "@/components/ui/label"; // Shadcn Label
import { useToast } from "@/hooks/use-toast"; // Shadcn Toast hook
import { Loader2 } from "lucide-react"; // For loading spinner
import { z } from "zod"; // For validation
import Link from "next/link";

// Zod schema for validation
const signupSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        toast({ title: "Success", description: "Account created! Complete your profile." });
        router.push("/dashboard/profile");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, toast]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate inputs
      signupSchema.parse({ email, password, confirmPassword });

      const { error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) throw signUpError;

      // Auto-login to trigger session (listener above handles redirect)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) throw signInError;

      // Listener will handle the redirect on SIGNED_IN event
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, err) => {
          acc[err.path[0] as keyof typeof errors] = err.message;
          return acc;
        }, {} as typeof errors);
        setErrors(fieldErrors);
      } else {
        const message = error instanceof Error ? error.message : "Signup failed. Please try again.";
        setErrors({ general: message });
        toast({ variant: "destructive", title: "Error", description: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback', // Update to production URL later
        },
      });

      if (error) throw error;

      // Listener above will handle the redirect after OAuth callback
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google signup failed.";
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-card dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-foreground dark:text-white">Sign Up for Tradies Directory</h2>
        <Button onClick={handleGoogleSignup} variant="outline" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing up with Google..." : "Sign Up with Google"}
        </Button>
        <p className="text-center text-sm text-muted-foreground dark:text-gray-400">or</p>
        <form onSubmit={handleSignup} className="space-y-4">
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
          <div>
            <Label htmlFor="confirmPassword" className="text-muted-foreground dark:text-gray-300">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
              disabled={loading}
            />
            {errors.confirmPassword && <p className="text-sm text-destructive dark:text-red-400 mt-1">{errors.confirmPassword}</p>}
          </div>
          {errors.general && <p className="text-sm text-destructive dark:text-red-400">{errors.general}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground dark:text-gray-400">
          Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
