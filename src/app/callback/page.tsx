"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");

      if (!code) {
        toast({ variant: "destructive", title: "Error", description: "Invalid callback — no code found." });
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to authenticate. Please try again." });
        router.push("/auth/login");
        return;
      }

      // Check if user has a profile (user_type set)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        // Existing user — redirect to dashboard
        toast({ title: "Welcome back!", description: "Logged in successfully." });
        router.push("/dashboard");
      } else {
        // New OAuth user — check localStorage for user_type from signup page
        const pendingUserType = localStorage.getItem("pending_user_type");
        if (pendingUserType === "business" || pendingUserType === "seeker") {
          await supabase.from("user_profiles").insert({
            id: session.user.id,
            user_type: pendingUserType,
            display_name: session.user.user_metadata?.full_name || session.user.email || "",
          });
          localStorage.removeItem("pending_user_type");

          if (pendingUserType === "business") {
            // Create company stub for business users
            await supabase.from("companies").insert({
              user_id: session.user.id,
              name: "",
              abn: "",
              location: { address: "", lat: 0, long: 0, region: "" },
              services: [],
              verified: false,
            });
            toast({ title: "Welcome!", description: "Complete your business profile." });
            router.push("/dashboard/profile");
          } else {
            toast({ title: "Welcome!", description: "Start exploring trusted tradies." });
            router.push("/dashboard");
          }
        } else {
          // No type chosen — redirect to signup to pick a type
          toast({ title: "Almost there!", description: "Please complete your registration." });
          router.push("/auth/signup?complete=true");
        }
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-foreground dark:text-white">Logging in...</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-foreground dark:text-white">Loading...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
