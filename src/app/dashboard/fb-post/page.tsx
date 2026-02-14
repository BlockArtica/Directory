"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import { createClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Share2 } from "lucide-react";
import TierGate from "@/components/dashboard/TierGate";

const FB_GROUP_NAME = process.env.NEXT_PUBLIC_FB_GROUP_NAME || "Northern Beaches Community";
const FB_POSTING_ENABLED = process.env.NEXT_PUBLIC_ENABLE_FB_POSTING === "true";

export default function FbPostPage() {
  const { session, loading } = useSession();
  const [tier, setTier] = useState("basic");
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", image: "" });
  const supabase = createClient();

  useEffect(() => {
    if (!session) return;

    const fetchTier = async () => {
      const { data: company } = await supabase
        .from("companies")
        .select("subscription_tier")
        .eq("user_id", session.user.id)
        .single();

      setTier(company?.subscription_tier || "basic");
      setFetching(false);
    };
    fetchTier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TierGate userTier={tier} requiredTier="pro">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Facebook Group Post</h1>

        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <span className="text-foreground dark:text-white font-medium">{FB_GROUP_NAME}</span>
          {!FB_POSTING_ENABLED && (
            <Badge variant="secondary">Coming Soon</Badge>
          )}
        </div>

        <Card className="bg-card dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground dark:text-white">
              Create a Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!FB_POSTING_ENABLED ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground dark:text-gray-400 mb-2">
                  Facebook group posting is coming soon.
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-500">
                  This feature will allow you to share updates directly to the {FB_GROUP_NAME} group.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <Label htmlFor="fb-title">Post Title</Label>
                  <Input
                    id="fb-title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="What's your update?"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fb-description">Description</Label>
                  <Textarea
                    id="fb-description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Share details about your business, services, or a special offer..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fb-image">Image URL (optional)</Label>
                  <Input
                    id="fb-image"
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <Button type="submit">
                  Post to {FB_GROUP_NAME}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </TierGate>
  );
}
