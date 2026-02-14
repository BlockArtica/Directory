"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import { createClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Briefcase, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(3, "Location is required"),
});

interface JobData {
  id: string;
  title: string;
  description: string;
  location: { address: string } | null;
  posted_at: string;
}

export default function PostJobPage() {
  const { session, loading } = useSession();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!session) return;

    const fetchJobs = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id, title, description, location, posted_at")
        .eq("user_id", session.user.id)
        .order("posted_at", { ascending: false });

      setJobs((data || []) as JobData[]);
      setFetching(false);
    };
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = jobSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!session) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        user_id: session.user.id,
        title: form.title,
        description: form.description,
        location: { address: form.address, lat: 0, long: 0, region: "" },
      })
      .select("id, title, description, location, posted_at")
      .single();

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: "Failed to post job.", variant: "destructive" });
      return;
    }

    if (data) {
      setJobs((prev) => [data as JobData, ...prev]);
      setForm({ title: "", description: "", address: "" });
      toast({ title: "Job Posted", description: "Your job listing is now live." });
    }
  };

  const deleteJob = async (jobId: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete job.", variant: "destructive" });
      return;
    }
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    toast({ title: "Deleted", description: "Job listing removed." });
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground dark:text-white">Post a Job</h1>

      {/* Job Form */}
      <Card className="bg-card dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" /> New Job Listing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Experienced Plumber Needed"
                className="mt-1"
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the role, requirements, and how to apply..."
                rows={4}
                className="mt-1"
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
            <div>
              <Label htmlFor="address">Location</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="e.g. Northern Beaches, NSW"
                className="mt-1"
              />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Job
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Jobs */}
      {jobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground dark:text-white">Your Job Listings</h2>
          {jobs.map((job) => (
            <Card key={job.id} className="bg-card dark:bg-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground dark:text-white">{job.title}</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1 line-clamp-2">
                      {job.description}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500 mt-2">
                      Posted {new Date(job.posted_at).toLocaleDateString()}
                      {job.location?.address && ` | ${job.location.address}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteJob(job.id)}
                    className="text-red-500 hover:text-red-700 shrink-0"
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
