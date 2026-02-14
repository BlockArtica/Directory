"use client"; // Client-side for data fetch

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn Card
import { Loader2 } from "lucide-react"; // For loading spinner
import { useToast } from "@/hooks/use-toast"; // Shadcn Toast hook

// Type for job (align with DB schema)
type Job = {
  id: string;
  title: string;
  description: string;
  location: { address: string; lat: number; long: number; region: string };
  posted_at: string;
};

export default function NoticeBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("posted_at", { ascending: false })
        .limit(10); // Limit to recent for front page

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load jobs." });
      } else {
        setJobs(data || []);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-foreground dark:text-white">Job & Notice Board</h2>
      <p className="text-center text-muted-foreground dark:text-gray-300">Latest opportunities for tradies in Australia</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground dark:text-gray-400">No jobs posted yet.</p>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-card dark:bg-gray-800 border border-border dark:border-gray-700">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-bold text-foreground dark:text-white">{job.title}</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-gray-300">{new Date(job.posted_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm text-foreground dark:text-white">
                <p className="line-clamp-3">{job.description}</p>
                <p className="flex items-center">
                  <span className="mr-2">Location:</span>
                  {job.location.region}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
