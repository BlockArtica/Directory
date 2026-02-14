"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useSession } from "@/lib/useSession";
import CompanyCard from "@/components/CompanyCard";
import { Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  abn: string;
  licenses: string[];
  social_links: Record<string, string>;
  google_reviews_url?: string;
  location: { address: string; lat: number; long: number; region: string };
  services: string[];
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  years_in_business?: number;
  number_of_employees?: number;
  certifications: string[];
  insurance_details?: string;
  operating_hours?: string;
  payment_methods: string[];
  areas_serviced: string[];
  references: string[];
}

export default function RecentViewsPage() {
  const { session, loading: sessionLoading } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!session) return;

    const fetchRecentViews = async () => {
      const { data } = await supabase
        .from("recent_views")
        .select("company_id, viewed_at, companies(*)")
        .eq("user_id", session.user.id)
        .order("viewed_at", { ascending: false })
        .limit(20);

      if (data) {
        const companyList = data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((v: any) => v.companies)
          .filter((c: Company | null): c is Company => c !== null);
        setCompanies(companyList);
      }
      setLoading(false);
    };
    fetchRecentViews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

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
        <Eye className="h-7 w-7 text-primary" /> Recently Viewed
      </h1>

      {companies.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground dark:text-gray-400">No recent views</p>
          <p className="text-sm text-muted-foreground dark:text-gray-500">
            Companies you view will appear here.
          </p>
          <Button asChild>
            <Link href="/directory">Browse Directory</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}
