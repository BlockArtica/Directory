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
};

export default function NoticeBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTypeFilters, setActiveTypeFilters] = useState<string[]>([]);
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

  // Filter jobs by active type filters (client-side)
  const filteredJobs = useMemo(() => {
    if (activeTypeFilters.length === 0) return jobs;
    return jobs.filter((j) => j.job_type && activeTypeFilters.includes(j.job_type));
  }, [jobs, activeTypeFilters]);

  const toggleTypeFilter = (type: string) => {
    setActiveTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

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
        <p className="text-muted-foreground dark:text-gray-300">Latest opportunities for tradies in Australia</p>
      </div>

      {/* Job type filter pills */}
      {availableJobTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {availableJobTypes.map((type) => {
            const isActive = activeTypeFilters.includes(type);
            return (
              <Badge
                key={type}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${isActive ? getJobTypeColor(type) : "hover:bg-muted"}`}
                onClick={() => toggleTypeFilter(type)}
              >
                {type}
              </Badge>
            );
          })}
          {activeTypeFilters.length > 0 && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-muted text-muted-foreground"
              onClick={() => setActiveTypeFilters([])}
            >
              Clear filters
            </Badge>
          )}
        </div>
      )}

      {/* Job rows */}
      <div className="rounded-lg border border-border bg-card dark:bg-gray-800/50 overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground dark:text-gray-400">
            {jobs.length === 0 ? "No jobs posted yet." : "No jobs match the selected filters."}
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
                    {job.location?.address && (
                      <p className="text-sm text-muted-foreground">
                        Location: {job.location.address}
                      </p>
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
