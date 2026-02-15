"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getDistance } from "geolib";
import CompanyRow from "@/components/directory/CompanyRow";
import FilterSidebar, { MobileFilterSheet, type FilterState, defaultFilters } from "@/components/directory/FilterSidebar";
import ActiveFilters from "@/components/directory/ActiveFilters";

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
  subscription_tier?: string;
  [key: string]: unknown;
}

interface ReviewMap {
  [companyId: string]: { average: number; count: number };
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <DirectoryContent />
    </Suspense>
  );
}

function DirectoryContent() {
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reviewMap, setReviewMap] = useState<ReviewMap>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const { toast } = useToast();
  const supabase = createClient();
  const leadTracked = useRef(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...defaultFilters,
    service: searchParams.get("service") || "",
    region: searchParams.get("region") || "",
  }));

  // Fetch companies + reviews on mount
  useEffect(() => {
    const fetchData = async () => {
      const [companiesRes, reviewsRes] = await Promise.all([
        supabase
          .from("companies")
          .select("*")
          .eq("verified", true)
          .order("subscription_tier", { ascending: false }),
        supabase
          .from("reviews")
          .select("company_id, rating"),
      ]);

      if (companiesRes.error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load directory." });
      } else {
        setCompanies((companiesRes.data || []) as Company[]);
      }

      // Build review map
      if (reviewsRes.data) {
        const map: ReviewMap = {};
        for (const r of reviewsRes.data as { company_id: string; rating: number }[]) {
          if (!map[r.company_id]) {
            map[r.company_id] = { average: 0, count: 0 };
          }
          map[r.company_id].count += 1;
          map[r.company_id].average += r.rating;
        }
        for (const id of Object.keys(map)) {
          map[id].average = Math.round((map[id].average / map[id].count) * 10) / 10;
        }
        setReviewMap(map);
      }

      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Try to get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, long: pos.coords.longitude }),
        () => {} // silently fail
      );
    }
  }, []);

  // Extract dynamic filter options from company data
  const availableServices = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => c.services.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [companies]);

  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.location?.region) set.add(c.location.region);
    });
    return Array.from(set).sort();
  }, [companies]);

  const availablePaymentMethods = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => c.payment_methods?.forEach((m) => set.add(m)));
    return Array.from(set).sort();
  }, [companies]);

  // Helper: get distance in km
  const getDistanceKm = (company: Company): number | null => {
    if (!userLocation || !company.location?.lat || !company.location?.long) return null;
    return Math.round(
      getDistance(
        { latitude: userLocation.lat, longitude: userLocation.long },
        { latitude: company.location.lat, longitude: company.location.long }
      ) / 1000
    );
  };

  // Apply all filters + sorting
  const filteredCompanies = useMemo(() => {
    let results = [...companies];

    // Service filter
    if (filters.service) {
      results = results.filter((c) => c.services.includes(filters.service));
    }

    // Region filter
    if (filters.region) {
      results = results.filter((c) => c.location?.region === filters.region);
    }

    // Min rating
    if (filters.minRating > 0) {
      results = results.filter((c) => {
        const review = reviewMap[c.id];
        return review && review.average >= filters.minRating;
      });
    }

    // Min years
    if (filters.minYears > 0) {
      results = results.filter((c) => (c.years_in_business || 0) >= filters.minYears);
    }

    // Min employees
    if (filters.minEmployees > 0) {
      results = results.filter((c) => (c.number_of_employees || 0) >= filters.minEmployees);
    }

    // Tier filter
    if (filters.tiers.length > 0) {
      results = results.filter((c) => filters.tiers.includes((c.subscription_tier || "basic").toLowerCase()));
    }

    // Payment methods
    if (filters.paymentMethods.length > 0) {
      results = results.filter((c) =>
        filters.paymentMethods.some((m) => c.payment_methods?.includes(m))
      );
    }

    // Boolean filters
    if (filters.hasInsurance) results = results.filter((c) => !!c.insurance_details);
    if (filters.hasCertifications) results = results.filter((c) => c.certifications?.length > 0);
    if (filters.hasWebsite) results = results.filter((c) => !!c.website);
    if (filters.hasOperatingHours) results = results.filter((c) => !!c.operating_hours);
    if (filters.hasReferences) results = results.filter((c) => c.references?.length > 0);
    if (filters.hasLicenses) results = results.filter((c) => c.licenses?.length > 0);

    // Max distance
    if (filters.maxDistance > 0 && userLocation) {
      results = results.filter((c) => {
        const dist = getDistanceKm(c);
        return dist !== null && dist <= filters.maxDistance;
      });
    }

    // Sorting
    switch (filters.sortBy) {
      case "rating":
        results.sort((a, b) => (reviewMap[b.id]?.average || 0) - (reviewMap[a.id]?.average || 0));
        break;
      case "reviews":
        results.sort((a, b) => (reviewMap[b.id]?.count || 0) - (reviewMap[a.id]?.count || 0));
        break;
      case "years":
        results.sort((a, b) => (b.years_in_business || 0) - (a.years_in_business || 0));
        break;
      case "distance":
        if (userLocation) {
          results.sort((a, b) => (getDistanceKm(a) ?? Infinity) - (getDistanceKm(b) ?? Infinity));
        }
        break;
      // "relevance" keeps the default tier-based order from Supabase
    }

    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, filters, reviewMap, userLocation]);

  // Lead tracking on initial load with URL params
  useEffect(() => {
    if (leadTracked.current || loading) return;
    const urlService = searchParams.get("service");
    const urlRegion = searchParams.get("region");
    if (urlService || urlRegion) {
      leadTracked.current = true;
      supabase.from("leads").insert({
        query: `${urlService || "Any"} in ${urlRegion || "Any"}`,
        user_location: userLocation ? { lat: userLocation.lat, long: userLocation.long } : null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground dark:text-white">Tradies Directory</h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          availableServices={availableServices}
          availableRegions={availableRegions}
          availablePaymentMethods={availablePaymentMethods}
          hasLocation={!!userLocation}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Active filters + count */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="lg:hidden">
                <MobileFilterSheet
                  filters={filters}
                  onChange={setFilters}
                  availableServices={availableServices}
                  availableRegions={availableRegions}
                  availablePaymentMethods={availablePaymentMethods}
                  hasLocation={!!userLocation}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {filteredCompanies.length} {filteredCompanies.length === 1 ? "result" : "results"}
              </p>
            </div>

            <ActiveFilters filters={filters} onChange={setFilters} />
          </div>

          {/* Company rows */}
          <div className="rounded-lg border border-border bg-card dark:bg-gray-800/50 overflow-hidden">
            {filteredCompanies.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground dark:text-gray-400">
                No results found. Try adjusting your filters.
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <CompanyRow
                  key={company.id}
                  company={company}
                  reviewData={reviewMap[company.id]}
                  isExpanded={expandedId === company.id}
                  onToggle={() => setExpandedId(expandedId === company.id ? null : company.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
