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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Briefcase, Trash2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasFeatureAccess } from "@/lib/tierGating";
import { JOB_TYPES, getJobTypeColor } from "@/lib/jobTypes";
import Link from "next/link";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(3, "Location is required"),
  job_type: z.string().min(1, "Job type is required"),
  pay_rate: z.string().optional(),
  contact_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  experience_level: z.string().optional(),
  application_deadline: z.string().optional(),
});

interface JobData {
  id: string;
  title: string;
  description: string;
  location: { address: string } | null;
  posted_at: string;
  job_type: string | null;
  pay_rate: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  experience_level: string | null;
  application_deadline: string | null;
}

export default function PostJobPage() {
  const { session, loading } = useSession();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyTier, setCompanyTier] = useState<string>("basic");
  const [form, setForm] = useState({ title: "", description: "", address: "", job_type: "", custom_job_type: "", pay_rate: "", contact_email: "", contact_phone: "", experience_level: "", application_deadline: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const supabase = createClient();
  const { toast } = useToast();

  const canPostJobs = hasFeatureAccess(companyTier, "post_jobs");

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      // Fetch company for tier check and company_id
      const { data: company } = await supabase
        .from("companies")
        .select("id, subscription_tier")
        .eq("user_id", session.user.id)
        .single();

      if (company) {
        setCompanyId(company.id);
        setCompanyTier(company.subscription_tier || "basic");
      }

      const { data } = await supabase
        .from("jobs")
        .select("id, title, description, location, posted_at, job_type, pay_rate, contact_email, contact_phone, experience_level, application_deadline")
        .eq("user_id", session.user.id)
        .order("posted_at", { ascending: false });

      setJobs((data || []) as JobData[]);
      setFetching(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const resolvedJobType = form.job_type === "Custom" ? form.custom_job_type : form.job_type;

    const result = jobSchema.safeParse({
      ...form,
      job_type: resolvedJobType,
    });
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
        company_id: companyId,
        title: form.title,
        description: form.description,
        location: { address: form.address, lat: 0, long: 0, region: "" },
        job_type: resolvedJobType,
        pay_rate: form.pay_rate || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        experience_level: form.experience_level || null,
        application_deadline: form.application_deadline || null,
      })
      .select("id, title, description, location, posted_at, job_type, pay_rate, contact_email, contact_phone, experience_level, application_deadline")
      .single();

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: "Failed to post job.", variant: "destructive" });
      return;
    }

    if (data) {
      setJobs((prev) => [data as JobData, ...prev]);
      setForm({ title: "", description: "", address: "", job_type: "", custom_job_type: "", pay_rate: "", contact_email: "", contact_phone: "", experience_level: "", application_deadline: "" });
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

  // Tier gate: show upgrade prompt for basic users
  if (!canPostJobs) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Post a Job</h1>
        <Card className="bg-card dark:bg-gray-800">
          <CardContent className="pt-6 text-center space-y-4">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground dark:text-white">Pro Feature</h2>
            <p className="text-muted-foreground dark:text-gray-400">
              Job posting is available on the Pro plan and above. Upgrade your subscription to start posting jobs.
            </p>
            <Button asChild>
              <Link href="/dashboard/subscription">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
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
              <Label htmlFor="job_type">Job Type</Label>
              <Select
                value={form.job_type}
                onValueChange={(value) => setForm((f) => ({ ...f, job_type: value, custom_job_type: value === "Custom" ? f.custom_job_type : "" }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {form.job_type === "Custom" && (
                <Input
                  value={form.custom_job_type}
                  onChange={(e) => setForm((f) => ({ ...f, custom_job_type: e.target.value }))}
                  placeholder="Enter custom job type"
                  className="mt-2"
                />
              )}
              {errors.job_type && <p className="text-sm text-red-500 mt-1">{errors.job_type}</p>}
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
            <div>
              <Label htmlFor="pay_rate">Pay / Rate (optional)</Label>
              <Input
                id="pay_rate"
                value={form.pay_rate}
                onChange={(e) => setForm((f) => ({ ...f, pay_rate: e.target.value }))}
                placeholder="e.g. $45/hr, $80k-$100k"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="experience_level">Experience Level (optional)</Label>
              <Select
                value={form.experience_level}
                onValueChange={(value) => setForm((f) => ({ ...f, experience_level: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry">Entry</SelectItem>
                  <SelectItem value="Mid-level">Mid-level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="application_deadline">Application Deadline (optional)</Label>
              <Input
                id="application_deadline"
                type="date"
                value={form.application_deadline}
                onChange={(e) => setForm((f) => ({ ...f, application_deadline: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Contact Email (optional)</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
                placeholder="hiring@example.com"
                className="mt-1"
              />
              {errors.contact_email && <p className="text-sm text-red-500 mt-1">{errors.contact_email}</p>}
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone (optional)</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
                placeholder="04XX XXX XXX"
                className="mt-1"
              />
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground dark:text-white">{job.title}</p>
                      {job.job_type && (
                        <Badge variant="secondary" className={getJobTypeColor(job.job_type)}>
                          {job.job_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1 line-clamp-2">
                      {job.description}
                    </p>
                    {(job.pay_rate || job.experience_level || job.application_deadline) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground dark:text-gray-400">
                        {job.pay_rate && <span>{job.pay_rate}</span>}
                        {job.experience_level && <span>{job.experience_level}</span>}
                        {job.application_deadline && <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>}
                      </div>
                    )}
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
