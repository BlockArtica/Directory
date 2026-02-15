"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getJobTypeColor } from "@/lib/jobTypes";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  description: string;
  job_type: string | null;
  location: { address: string; lat: number; long: number; region: string } | null;
  posted_at: string;
  company_id: string | null;
  companies: { id: string; name: string } | { id: string; name: string }[] | null;
  pay_rate: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  experience_level: string | null;
  application_deadline: string | null;
};

export default function NoticeBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All");
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(id, name)")
        .order("posted_at", { ascending: false })
        .limit(20);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load jobs." });
      } else {
        setJobs((data || []) as Job[]);
      }
      setLoading(false);
    };
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract unique job types from data for filter pills
  const availableJobTypes = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.job_type) set.add(j.job_type);
    });
    return Array.from(set).sort();
  }, [jobs]);

  // Filter jobs by active tab (single selection)
  const filteredJobs = useMemo(() => {
    if (activeTab === "All") return jobs;
    return jobs.filter((j) => j.job_type === activeTab);
  }, [jobs, activeTab]);

  // Normalize Supabase join (array vs object)
  const getCompany = (job: Job) => {
    if (!job.companies) return null;
    if (Array.isArray(job.companies)) return job.companies[0] || null;
    return job.companies;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground dark:text-white">Job & Notice Board</h2>
        <p className="text-muted-foreground dark:text-gray-300">Latest Opportunities &amp; Notices in Australia</p>
      </div>

      {/* Horizontal category tabs */}
      {availableJobTypes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-center">
          {["All", ...availableJobTypes].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Job rows */}
      <div className="rounded-lg border border-border bg-card dark:bg-gray-800/50 overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground dark:text-gray-400">
            {jobs.length === 0 ? "No jobs posted yet." : "No jobs in this category."}
          </div>
        ) : (
          filteredJobs.map((job) => {
            const company = getCompany(job);
            const isExpanded = expandedId === job.id;

            return (
              <Collapsible
                key={job.id}
                open={isExpanded}
                onOpenChange={() => setExpandedId(isExpanded ? null : job.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border">
                    {/* Left: Type badge, title, company, region, date */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {job.job_type && (
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-medium ${getJobTypeColor(job.job_type)}`}>
                            {job.job_type}
                          </Badge>
                        )}
                        <span className="font-semibold text-foreground dark:text-white truncate">
                          {job.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground">
                        {company && (
                          <>
                            <Link
                              href={`/directory?company=${company.id}`}
                              className="hover:text-primary hover:underline transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {company.name}
                            </Link>
                            <span>·</span>
                          </>
                        )}
                        {job.location?.region && (
                          <>
                            <span>{job.location.region}</span>
                            <span>·</span>
                          </>
                        )}
                        <span>{new Date(job.posted_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Right: Chevron */}
                    <div className="shrink-0">
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 py-4 bg-muted/30 border-b border-border space-y-3">
                    <p className="text-sm text-foreground dark:text-gray-200 whitespace-pre-line">
                      {job.description}
                    </p>
                    {(job.pay_rate || job.experience_level || job.contact_email || job.contact_phone || job.application_deadline || job.location?.address) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        {job.pay_rate && <span>Pay: {job.pay_rate}</span>}
                        {job.experience_level && <span>Experience: {job.experience_level}</span>}
                        {job.location?.address && <span>Location: {job.location.address}</span>}
                        {job.application_deadline && <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>}
                        {job.contact_email && <span>Email: {job.contact_email}</span>}
                        {job.contact_phone && <span>Phone: {job.contact_phone}</span>}
                      </div>
                    )}
                    {company && (
                      <Link
                        href={`/directory?company=${company.id}`}
                        className="inline-flex items-center text-sm text-primary hover:underline font-medium"
                      >
                        View in Directory →
                      </Link>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}
