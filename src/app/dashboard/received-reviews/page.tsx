"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import { createClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
}

export default function ReceivedReviewsPage() {
  const { session, loading } = useSession();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [fetching, setFetching] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!session) return;

    const fetchReviews = async () => {
      // Get company ID first
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!company) {
        setFetching(false);
        return;
      }

      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, user_id")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      setReviews((data || []) as ReviewData[]);
      setFetching(false);
    };
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 0;

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground dark:text-white">Reviews</h1>

      {/* Aggregate Stats */}
      <Card className="bg-card dark:bg-gray-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground dark:text-white">{totalReviews}</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Total Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground dark:text-white">
                {avgRating > 0 ? `${avgRating}/5` : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Average Rating</p>
            </div>
            <div className="space-y-1">
              {distribution.map(({ star, count }) => {
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-6 text-right text-muted-foreground dark:text-gray-400">{star}</span>
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <div className="flex-1 bg-muted dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground dark:text-gray-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-muted-foreground dark:text-gray-400">No reviews received yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-card dark:bg-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground dark:text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground dark:text-gray-200">
                  {review.comment || "No comment provided."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
