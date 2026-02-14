"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useSession } from "@/lib/useSession";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  companies: { name: string } | null;
}

export default function ReviewsPage() {
  const { session, loading: sessionLoading } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!session) return;

    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, companies(name)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = data.map((r: any) => ({
          ...r,
          companies: Array.isArray(r.companies) ? r.companies[0] || null : r.companies,
        }));
        setReviews(mapped as Review[]);
      }
      setLoading(false);
    };
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete review." });
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Deleted", description: "Review removed." });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
      />
    ));
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground dark:text-white flex items-center gap-2">
        <Star className="h-7 w-7 text-primary" /> Your Reviews
      </h1>

      {reviews.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Star className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground dark:text-gray-400">No reviews yet</p>
          <p className="text-sm text-muted-foreground dark:text-gray-500">
            Leave reviews for tradies you&apos;ve worked with.
          </p>
          <Button asChild>
            <Link href="/directory">Browse Directory</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-card dark:bg-gray-800">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground dark:text-white">
                      {review.companies?.name || "Unknown Company"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(review.rating)}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
