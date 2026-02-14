"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import { createClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuoteData {
  id: string;
  message: string;
  status: string;
  created_at: string;
  user_id: string;
}

type FilterStatus = "all" | "pending" | "responded" | "closed";

export default function ReceivedQuotesPage() {
  const { session, loading } = useSession();
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [fetching, setFetching] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!session) return;

    const fetchQuotes = async () => {
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
        .from("quote_requests")
        .select("id, message, status, created_at, user_id")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      setQuotes((data || []) as QuoteData[]);
      setFetching(false);
    };
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const updateStatus = async (quoteId: string, newStatus: string) => {
    const { error } = await supabase
      .from("quote_requests")
      .update({ status: newStatus })
      .eq("id", quoteId);

    if (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
      return;
    }

    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q))
    );
    toast({ title: "Updated", description: `Quote marked as ${newStatus}.` });
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredQuotes = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case "responded":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Responded</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filters: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Responded", value: "responded" },
    { label: "Closed", value: "closed" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground dark:text-white">Quote Requests</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <p className="text-muted-foreground dark:text-gray-400">
          {filter === "all" ? "No quote requests received yet." : `No ${filter} quotes.`}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="bg-card dark:bg-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium text-foreground dark:text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Quote Request
                  </CardTitle>
                  {statusBadge(quote.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground dark:text-gray-200">{quote.message}</p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">
                  Received {new Date(quote.created_at).toLocaleDateString()}
                </p>
                {quote.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(quote.id, "responded")}>
                      Mark Responded
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(quote.id, "closed")}>
                      Close
                    </Button>
                  </div>
                )}
                {quote.status === "responded" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(quote.id, "closed")}>
                    Close
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
