"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useSession } from "@/lib/useSession";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface QuoteRequest {
  id: string;
  message: string;
  status: "pending" | "responded" | "closed";
  created_at: string;
  companies: { name: string } | null;
}

export default function QuotesPage() {
  const { session, loading: sessionLoading } = useSession();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!session) return;

    const fetchQuotes = async () => {
      const { data } = await supabase
        .from("quote_requests")
        .select("id, message, status, created_at, companies(name)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = data.map((q: any) => ({
          ...q,
          companies: Array.isArray(q.companies) ? q.companies[0] || null : q.companies,
        }));
        setQuotes(mapped as QuoteRequest[]);
      }
      setLoading(false);
    };
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const statusVariant = (status: string) => {
    switch (status) {
      case "responded": return "default";
      case "closed": return "secondary";
      default: return "outline";
    }
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
        <MessageSquare className="h-7 w-7 text-primary" /> Quote Requests
      </h1>

      {quotes.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground dark:text-gray-400">No quote requests yet</p>
          <p className="text-sm text-muted-foreground dark:text-gray-500">
            Request quotes from businesses in the directory.
          </p>
          <Button asChild>
            <Link href="/directory">Browse Directory</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => (
            <Card key={quote.id} className="bg-card dark:bg-gray-800">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground dark:text-white">
                      {quote.companies?.name || "Unknown Company"}
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2 mt-1">
                      {quote.message}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={statusVariant(quote.status)} className="capitalize shrink-0">
                    {quote.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
