"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import { useUserProfile } from "@/lib/useUserProfile";
import { createClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Heart, Search, Eye, MessageSquare, Star,
  User, Briefcase, Megaphone, BarChart3, CheckCircle, XCircle,
} from "lucide-react";
import Link from "next/link";
import OnboardingProgress from "@/components/OnboardingProgress";
import StatCard from "@/components/dashboard/StatCard";
import { hasFeatureAccess } from "@/lib/tierGating";

interface CompanyData {
  id: string;
  name: string;
  abn: string;
  location: { address: string; lat: number; long: number; region: string };
  services: string[];
  subscription_tier: string;
  verified: boolean;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
}

interface QuoteData {
  id: string;
  message: string;
  status: string;
  created_at: string;
}

interface JobData {
  id: string;
  title: string;
  posted_at: string;
}

export default function DashboardPage() {
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useUserProfile();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [seekerStats, setSeekerStats] = useState({ favourites: 0, savedSearches: 0 });
  const [businessStats, setBusinessStats] = useState({
    profileViews: 0,
    reviewCount: 0,
    avgRating: 0,
    pendingQuotes: 0,
  });
  const [recentReviews, setRecentReviews] = useState<ReviewData[]>([]);
  const [pendingQuotes, setPendingQuotes] = useState<QuoteData[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!session || !profile) return;

    if (profile.user_type === "seeker") {
      const fetchSeekerStats = async () => {
        const [favResult, searchResult] = await Promise.all([
          supabase.from("favourites").select("id", { count: "exact", head: true }).eq("user_id", session.user.id),
          supabase.from("saved_searches").select("id", { count: "exact", head: true }).eq("user_id", session.user.id),
        ]);
        setSeekerStats({
          favourites: favResult.count || 0,
          savedSearches: searchResult.count || 0,
        });
        setDataLoading(false);
      };
      fetchSeekerStats();
      return;
    }

    // Business dashboard data
    const fetchBusinessData = async () => {
      // Fetch company first
      const { data: companyData } = await supabase
        .from("companies")
        .select("id, name, abn, location, services, subscription_tier, verified")
        .eq("user_id", session.user.id)
        .single();

      if (!companyData) {
        setDataLoading(false);
        return;
      }

      const comp = companyData as CompanyData;
      setCompany(comp);

      // Check if profile is complete
      const isComplete = comp.name && comp.abn && comp.location?.address && comp.services?.length > 0;

      if (!isComplete) {
        setDataLoading(false);
        return;
      }

      // Fetch all stats in parallel
      const [leadsResult, reviewsResult, pendingQuotesResult, allReviewsResult, jobsResult] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("company_id", comp.id),
        supabase.from("reviews").select("id, rating, comment, created_at, user_id").eq("company_id", comp.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("quote_requests").select("id, message, status, created_at").eq("company_id", comp.id).eq("status", "pending").order("created_at", { ascending: false }).limit(3),
        supabase.from("reviews").select("rating").eq("company_id", comp.id),
        supabase.from("jobs").select("id, title, posted_at").eq("user_id", session.user.id).order("posted_at", { ascending: false }).limit(2),
      ]);

      const allRatings = (allReviewsResult.data || []) as { rating: number }[];
      const avg = allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0;

      setBusinessStats({
        profileViews: leadsResult.count || 0,
        reviewCount: allRatings.length,
        avgRating: Math.round(avg * 10) / 10,
        pendingQuotes: pendingQuotesResult.data?.length || 0,
      });
      setRecentReviews((reviewsResult.data || []) as ReviewData[]);
      setPendingQuotes((pendingQuotesResult.data || []) as QuoteData[]);
      setRecentJobs((jobsResult.data || []) as JobData[]);
      setDataLoading(false);
    };

    fetchBusinessData();
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
          <StatCard icon={Heart} value={seekerStats.favourites} label="Favourites" />
          <StatCard icon={Search} value={seekerStats.savedSearches} label="Saved Searches" />
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

  // Business Dashboard — Loading
  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isProfileComplete = company
    ? !!(company.name && company.abn && company.location?.address && company.services?.length > 0)
    : false;

  const tier = company?.subscription_tier || "basic";

  // Business Dashboard — Incomplete profile (onboarding mode)
  if (!isProfileComplete) {
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

  // Business Dashboard — Full dashboard (company is guaranteed non-null here)
  if (!company) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-white">
            Welcome, {company.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="capitalize">{tier}</Badge>
            {company.verified ? (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground flex items-center gap-1">
                <XCircle className="h-3 w-3" /> Unverified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Eye} value={businessStats.profileViews} label="Profile Views" />
        <StatCard icon={Star} value={businessStats.reviewCount} label="Reviews" />
        <StatCard icon={Star} value={businessStats.avgRating > 0 ? `${businessStats.avgRating}/5` : "N/A"} label="Avg Rating" />
        <StatCard icon={MessageSquare} value={businessStats.pendingQuotes} label="Pending Quotes" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/profile" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Edit Profile
            </Link>
          </Button>
          {hasFeatureAccess(tier, "post_jobs") && (
            <Button asChild variant="outline">
              <Link href="/dashboard/post-job" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Post Job
              </Link>
            </Button>
          )}
          {hasFeatureAccess(tier, "ad_booking") && (
            <Button asChild variant="outline">
              <Link href="/dashboard/ad-booking" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" /> Book Ad Spot
              </Link>
            </Button>
          )}
          {hasFeatureAccess(tier, "analytics") && (
            <Button asChild variant="outline">
              <Link href="/dashboard/analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Analytics
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Preview sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <Card className="bg-card dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground dark:text-gray-400">No reviews yet.</p>
            ) : (
              <>
                {recentReviews.map((review) => (
                  <div key={review.id} className="border-b border-border dark:border-gray-700 pb-2 last:border-0">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-foreground dark:text-gray-200 line-clamp-2">
                      {review.comment || "No comment"}
                    </p>
                  </div>
                ))}
                <Button asChild variant="link" className="px-0">
                  <Link href="/dashboard/received-reviews">View All</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Quotes */}
        <Card className="bg-card dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Pending Quotes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingQuotes.length === 0 ? (
              <p className="text-sm text-muted-foreground dark:text-gray-400">No pending quotes.</p>
            ) : (
              <>
                {pendingQuotes.map((quote) => (
                  <div key={quote.id} className="border-b border-border dark:border-gray-700 pb-2 last:border-0">
                    <p className="text-sm text-foreground dark:text-gray-200 line-clamp-2">{quote.message}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <Button asChild variant="link" className="px-0">
                  <Link href="/dashboard/received-quotes">Manage</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Your Jobs */}
        <Card className="bg-card dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Your Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground dark:text-gray-400">No jobs posted yet.</p>
            ) : (
              <>
                {recentJobs.map((job) => (
                  <div key={job.id} className="border-b border-border dark:border-gray-700 pb-2 last:border-0">
                    <p className="text-sm font-medium text-foreground dark:text-gray-200">{job.title}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Posted {new Date(job.posted_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </>
            )}
            {hasFeatureAccess(tier, "post_jobs") && (
              <Button asChild variant="link" className="px-0">
                <Link href="/dashboard/post-job">Post New</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Ad Spots */}
        {hasFeatureAccess(tier, "ad_booking") && (
          <Card className="bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" /> Ad Spots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-3">
                Book ad spots on the homepage for more visibility.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/ad-booking">Book a Spot</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
