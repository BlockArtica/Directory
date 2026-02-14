"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import { useUserProfile } from "@/lib/useUserProfile";
import { createClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Heart, Search, Eye, MessageSquare, Star } from "lucide-react";
import Link from "next/link";
import OnboardingProgress from "@/components/OnboardingProgress";

export default function DashboardPage() {
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useUserProfile();
  const [stats, setStats] = useState({ favourites: 0, savedSearches: 0 });
  const supabase = createClient();

  useEffect(() => {
    if (!session || !profile || profile.user_type !== "seeker") return;

    const fetchStats = async () => {
      const [favResult, searchResult] = await Promise.all([
        supabase.from("favourites").select("id", { count: "exact", head: true }).eq("user_id", session.user.id),
        supabase.from("saved_searches").select("id", { count: "exact", head: true }).eq("user_id", session.user.id),
      ]);
      setStats({
        favourites: favResult.count || 0,
        savedSearches: searchResult.count || 0,
      });
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, profile]);

  if (sessionLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  // Seeker Dashboard
  if (profile?.user_type === "seeker") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-white">
            Welcome, {profile.display_name || session.user.email}
          </h1>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Find and manage your favourite tradies
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card dark:bg-gray-800">
            <CardContent className="pt-6 text-center">
              <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground dark:text-white">{stats.favourites}</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Favourites</p>
            </CardContent>
          </Card>
          <Card className="bg-card dark:bg-gray-800">
            <CardContent className="pt-6 text-center">
              <Search className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground dark:text-white">{stats.savedSearches}</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Saved Searches</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card dark:bg-gray-800 rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground dark:text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" /> Favourites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground dark:text-gray-400">View your saved tradies.</p>
              <Button asChild variant="default" className="mt-4">
                <Link href="/dashboard/favourites">View Favourites</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-card dark:bg-gray-800 rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground dark:text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" /> Recent Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground dark:text-gray-400">Companies you recently viewed.</p>
              <Button asChild variant="default" className="mt-4">
                <Link href="/dashboard/recent-views">View History</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-card dark:bg-gray-800 rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground dark:text-gray-400">Track your quote requests.</p>
              <Button asChild variant="default" className="mt-4">
                <Link href="/dashboard/quotes">View Quotes</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-card dark:bg-gray-800 rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" /> Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground dark:text-gray-400">Manage your reviews.</p>
              <Button asChild variant="default" className="mt-4">
                <Link href="/dashboard/reviews">View Reviews</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-card dark:bg-gray-800 rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground dark:text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" /> Browse Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground dark:text-gray-400">Find trusted tradies near you.</p>
              <Button asChild variant="default" className="mt-4">
                <Link href="/directory">Browse Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Business Dashboard
  return (
    <div className="space-y-8">
      <OnboardingProgress />
      <div>
        <h1 className="text-3xl font-bold text-foreground dark:text-white">
          Welcome, {profile?.display_name || session.user.email}
        </h1>
        <p className="text-muted-foreground dark:text-gray-300 mt-1">
          Manage your business profile and subscription
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card dark:bg-gray-800 rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground dark:text-white">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground dark:text-gray-400">Complete or update your company details.</p>
            <Button asChild variant="default" className="mt-4">
              <Link href="/dashboard/profile">Go to Profile</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-card dark:bg-gray-800 rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground dark:text-white">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground dark:text-gray-400">Manage your tier and payments.</p>
            <Button asChild variant="default" className="mt-4">
              <Link href="/dashboard/subscription">Go to Subscription</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
