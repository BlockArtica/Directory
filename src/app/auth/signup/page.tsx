"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase, Search } from "lucide-react";
import { z } from "zod";
import Link from "next/link";

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

type UserType = "business" | "seeker";

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSelectType = (type: UserType) => {
    setUserType(type);
    setStep(2);
  };

  const handleGoogleSignup = async () => {
    if (!userType) return;
    setLoading(true);
    try {
      // Store user_type in localStorage so callback can pick it up
      localStorage.setItem("pending_user_type", userType);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google signup failed.";
      toast({ variant: "destructive", title: "Error", description: message });
      localStorage.removeItem("pending_user_type");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) return;
    setErrors({});
    setLoading(true);

    try {
      signupSchema.parse({ email, password, confirmPassword });

      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      // Auto-login
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const userId = signInData.session?.user.id;
      if (!userId) throw new Error("Failed to get user session");

      // Create user profile with chosen type
      await supabase.from("user_profiles").insert({
        id: userId,
        user_type: userType,
        display_name: email.split("@")[0],
      });

      if (userType === "business") {
        // Create company stub for business users
        await supabase.from("companies").insert({
          user_id: userId,
          name: "",
          abn: "",
          location: { address: "", lat: 0, long: 0, region: "" },
          services: [],
          verified: false,
        });
        toast({ title: "Welcome!", description: "Complete your business profile to get started." });
        router.push("/dashboard/profile");
      } else {
        toast({ title: "Welcome!", description: "Start exploring trusted tradies." });
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
        const message = error instanceof Error ? error.message : "Signup failed. Please try again.";
        setErrors({ general: message });
        toast({ variant: "destructive", title: "Error", description: message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 px-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-card dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-foreground dark:text-white">Sign Up for Tradies Directory</h2>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground dark:text-gray-400">How will you use Tradies Directory?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                className="cursor-pointer hover:border-primary transition-colors bg-card dark:bg-gray-700"
                onClick={() => handleSelectType("business")}
              >
                <CardHeader className="items-center pb-2">
                  <Briefcase className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg text-foreground dark:text-white">Business</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-center text-muted-foreground dark:text-gray-400">
                    List your trade business, get leads, and grow
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:border-primary transition-colors bg-card dark:bg-gray-700"
                onClick={() => handleSelectType("seeker")}
              >
                <CardHeader className="items-center pb-2">
                  <Search className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg text-foreground dark:text-white">Seeker</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-center text-muted-foreground dark:text-gray-400">
                    Find trusted tradies, save favourites, request quotes
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <button
              onClick={() => { setStep(1); setUserType(null); }}
              className="text-sm text-muted-foreground dark:text-gray-400 hover:text-primary"
            >
              &larr; Back to type selection
            </button>
            <p className="text-center text-sm text-muted-foreground dark:text-gray-400">
              Signing up as <span className="font-semibold text-foreground dark:text-white capitalize">{userType}</span>
            </p>

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
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground dark:text-gray-400">
          Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
