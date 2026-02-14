import { SupabaseClient } from "@supabase/supabase-js";

// Get user profile from user_profiles table
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as { id: string; user_type: "business" | "seeker"; display_name: string | null; created_at: string };
}

// Upsert user profile (create if not exists, update if exists)
export async function ensureUserProfile(
  supabase: SupabaseClient,
  userId: string,
  userType: "business" | "seeker",
  displayName?: string
) {
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      id: userId,
      user_type: userType,
      display_name: displayName || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get list of company IDs the user has favourited
export async function getUserFavourites(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("favourites")
    .select("company_id")
    .eq("user_id", userId);

  if (error) return [];
  return data.map((f: { company_id: string }) => f.company_id);
}

// Toggle favourite: add if not exists, remove if exists
export async function toggleFavourite(supabase: SupabaseClient, userId: string, companyId: string) {
  // Check if favourite exists
  const { data: existing } = await supabase
    .from("favourites")
    .select("id")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .single();

  if (existing) {
    // Remove
    await supabase
      .from("favourites")
      .delete()
      .eq("user_id", userId)
      .eq("company_id", companyId);
    return false; // now unfavourited
  } else {
    // Add
    await supabase
      .from("favourites")
      .insert({ user_id: userId, company_id: companyId });
    return true; // now favourited
  }
}

// Get recent views with company data
export async function getRecentViews(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("recent_views")
    .select("company_id, viewed_at, companies(*)")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return data;
}

// Track a company view (insert + prune to keep last 20)
export async function trackView(supabase: SupabaseClient, userId: string, companyId: string) {
  // Delete existing view of the same company (so we can re-insert with fresh timestamp)
  await supabase
    .from("recent_views")
    .delete()
    .eq("user_id", userId)
    .eq("company_id", companyId);

  // Insert new view
  await supabase
    .from("recent_views")
    .insert({ user_id: userId, company_id: companyId });

  // Prune old views beyond 20
  const { data: allViews } = await supabase
    .from("recent_views")
    .select("id")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false });

  if (allViews && allViews.length > 20) {
    const idsToDelete = allViews.slice(20).map((v: { id: string }) => v.id);
    await supabase
      .from("recent_views")
      .delete()
      .in("id", idsToDelete);
  }
}
