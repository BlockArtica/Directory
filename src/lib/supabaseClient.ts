import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase"; // Optional: Generate types from DB schema (supabase gen types typescript --local > src/types/supabase.ts)

// Client-side client (for "use client" components/pages)
export const createClient = () =>
  createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Server-side client (for server components/actions)
export const createServerClient = () =>
  createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
