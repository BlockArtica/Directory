"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import { createClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Star, MessageSquare, Heart, BarChart3 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import TierGate from "@/components/dashboard/TierGate";

type Period = "7d" | "30d" | "90d";

interface AnalyticsData {
  profileViews: number;
  searchAppearances: number;
  quoteRequests: number;
  reviews: number;
  favourites: number;
  viewsByDay: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const { session, loading } = useSession();
  const [tier, setTier] = useState("basic");
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [fetching, setFetching] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!session) return;

    const fetchAnalytics = async () => {
      const { data: company } = await supabase
        .from("companies")
        .select("id, subscription_tier")
        .eq("user_id", session.user.id)
        .single();

      if (!company) {
        setFetching(false);
        return;
      }

      setTier(company.subscription_tier || "basic");

      const daysMap: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90 };
      const days = daysMap[period];
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceISO = since.toISOString();

      const [leadsResult, reviewsResult, quotesResult, favouritesResult, viewsResult] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("company_id", company.id).gte("timestamp", sinceISO),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("company_id", company.id).gte("created_at", sinceISO),
        supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("company_id", company.id).gte("created_at", sinceISO),
        supabase.from("favourites").select("id", { count: "exact", head: true }).eq("company_id", company.id),
        supabase.from("leads").select("timestamp").eq("company_id", company.id).gte("timestamp", sinceISO).order("timestamp", { ascending: true }),
      ]);

      // Group views by day
      const viewsByDayMap: Record<string, number> = {};
      ((viewsResult.data || []) as { timestamp: string }[]).forEach((lead) => {
        const day = new Date(lead.timestamp).toLocaleDateString("en-AU", { month: "short", day: "numeric" });
        viewsByDayMap[day] = (viewsByDayMap[day] || 0) + 1;
      });
      const viewsByDay = Object.entries(viewsByDayMap).map(([date, count]) => ({ date, count }));

      setData({
        profileViews: leadsResult.count || 0,
        searchAppearances: leadsResult.count || 0,
        quoteRequests: quotesResult.count || 0,
        reviews: reviewsResult.count || 0,
        favourites: favouritesResult.count || 0,
        viewsByDay,
      });
      setFetching(false);
    };
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, period]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TierGate userTier={tier} requiredTier="enterprise">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Analytics
          </h1>
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => { setFetching(true); setPeriod(p); }}
              >
                {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard icon={Eye} value={data.profileViews} label="Profile Views" />
              <StatCard icon={Eye} value={data.searchAppearances} label="Search Appearances" />
              <StatCard icon={MessageSquare} value={data.quoteRequests} label="Quote Requests" />
              <StatCard icon={Star} value={data.reviews} label="New Reviews" />
              <StatCard icon={Heart} value={data.favourites} label="Total Favourites" />
            </div>

            {/* Profile Views Chart */}
            <Card className="bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground dark:text-white">
                  Profile Views Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.viewsByDay.length === 0 ? (
                  <p className="text-sm text-muted-foreground dark:text-gray-400 py-8 text-center">
                    No view data for this period.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const maxCount = Math.max(...data.viewsByDay.map((d) => d.count), 1);
                      return data.viewsByDay.map(({ date, count }) => (
                        <div key={date} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground dark:text-gray-400 w-16 text-right shrink-0">
                            {date}
                          </span>
                          <div className="flex-1 bg-muted dark:bg-gray-700 rounded-full h-4">
                            <div
                              className="bg-primary h-4 rounded-full transition-all"
                              style={{ width: `${(count / maxCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-foreground dark:text-gray-300 w-8">{count}</span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </TierGate>
  );
}
