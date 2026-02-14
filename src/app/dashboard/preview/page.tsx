"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import { createClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";
import Link from "next/link";
import CompanyCard from "@/components/CompanyCard";

interface CompanyData {
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

export default function PreviewPage() {
  const { session, loading } = useSession();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [fetching, setFetching] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!session) return;

    const fetchCompany = async () => {
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        setCompany({
          ...data,
          licenses: data.licenses || [],
          social_links: data.social_links || {},
          certifications: data.certifications || [],
          payment_methods: data.payment_methods || [],
          areas_serviced: data.areas_serviced || [],
          references: data.references || [],
        } as CompanyData);
      }
      setFetching(false);
    };
    fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company || !company.name) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Public Profile Preview</h1>
        <p className="text-muted-foreground dark:text-gray-400">
          Complete your profile first to see a preview.
        </p>
        <Button asChild>
          <Link href="/dashboard/profile">Complete Profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground dark:text-white">Public Profile Preview</h1>

      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <Info className="h-5 w-5 text-blue-500 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          This is how your profile appears to the public in the directory.
        </p>
      </div>

      <div className="max-w-xl">
        <CompanyCard company={company} />
      </div>

      <Button asChild variant="outline">
        <Link href="/dashboard/profile">Edit Profile</Link>
      </Button>
    </div>
  );
}
