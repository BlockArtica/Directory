"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useSession } from "@/lib/useSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SavedSearch {
  id: string;
  query: string;
  filters: Record<string, string>;
  created_at: string;
}

export default function SavedSearchesPage() {
  const { session, loading: sessionLoading } = useSession();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!session) return;

    const fetchSearches = async () => {
      const { data } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) setSearches(data as SavedSearch[]);
      setLoading(false);
    };
    fetchSearches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleDelete = async (id: string) => {
    await supabase.from("saved_searches").delete().eq("id", id);
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const buildSearchUrl = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.query) params.set("q", search.query);
    if (search.filters) {
      Object.entries(search.filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    return `/directory?${params.toString()}`;
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
        <Search className="h-7 w-7 text-primary" /> Saved Searches
      </h1>

      {searches.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Search className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground dark:text-gray-400">No saved searches yet</p>
          <p className="text-sm text-muted-foreground dark:text-gray-500">
            Save your searches from the directory to quickly run them again.
          </p>
          <Button asChild>
            <Link href="/directory">Browse Directory</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((search) => (
            <Card key={search.id} className="bg-card dark:bg-gray-800">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground dark:text-white truncate">{search.query}</p>
                  {Object.keys(search.filters || {}).length > 0 && (
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Filters: {Object.entries(search.filters).map(([k, v]) => `${k}=${v}`).join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground dark:text-gray-500">
                    {new Date(search.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href={buildSearchUrl(search)}>
                      <ExternalLink className="h-4 w-4 mr-1" /> Run
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(search.id)}
                    className="text-destructive hover:text-destructive"
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
