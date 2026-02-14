import { createBrowserClient } from "@supabase/ssr";

// Client-side client (for "use client" components/pages)
// Uses browser localStorage for session persistence
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
