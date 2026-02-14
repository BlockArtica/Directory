"use client"; // Client-side for session handling

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists
import { useToast } from "@/hooks/use-toast"; // Shadcn Toast hook
import { Loader2 } from "lucide-react"; // For loading spinner

export default function AuthCallback() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");

    if (accessToken && refreshToken && expiresIn) {
      // Set the session from OAuth tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ data: { session }, error }) => {
        if (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to set session." });
          router.push("/auth/login");
        } else if (session) {
          toast({ title: "Success", description: "Logged in with Google! Complete your profile." });
          router.push("/dashboard/profile");
        }
      });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Invalid callback parameters." });
      router.push("/auth/login");
    }
  }, [router, toast, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-foreground dark:text-white">Logging in...</p>
    </div>
  );
}
