"use client"; // Client-side for search/filter interactions

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists
import { Input } from "@/components/ui/input"; // Shadcn Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Shadcn Select
import { Button } from "@/components/ui/button"; // Shadcn Button
import { useToast } from "@/hooks/use-toast"; // Shadcn Toast hook
import { Loader2 } from "lucide-react"; // For loading spinner
import { z } from "zod"; // For validation
import CompanyCard from "@/components/CompanyCard"; // Assumes components/CompanyCard.tsx exists
import { getDistance } from "geolib"; // For distance sorting

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

// Zod schema for search query
const searchSchema = z.object({
  service: z.string().optional(),
  region: z.string().optional(),
  userLocation: z.object({ lat: z.number(), long: z.number() }).optional(), // From browser geolocation
});

// Fetch available services/regions from DB (static for now; future dynamic)
const availableServices = ["Plumbing", "Electrical", "Carpentry", "Painting", "Landscaping", "Roofing"];
const availableRegions = ["Northern Beaches, NSW", "Brisbane, QLD"]; // From regions table seed

export default function DirectoryPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [service, setService] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("verified", true)
        .order("subscription_tier", { ascending: false }); // Priority by tier (enterprise > pro > basic)

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load directory." });
      } else {
        setCompanies(data || []);
        setFilteredCompanies(data || []);
      }
      setLoading(false);
    };
    fetchCompanies();

    // Get user location (with permission)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, long: pos.coords.longitude }),
        () => toast({ title: "Info", description: "Location access denied. Sorting without distance." })
      );
    }
  }, []);

  const handleSearch = async () => {
    setSearching(true);
    try {
      searchSchema.parse({ service, region, userLocation });

      let results = companies;
      if (service) {
        results = results.filter((comp) => comp.services.includes(service));
      }
      if (region) {
        results = results.filter((comp) => comp.location.region === region);
      }

      // Sort by distance if userLocation available
      if (userLocation) {
        results = results.sort((a, b) => {
          const distA = getDistance({ latitude: userLocation.lat, longitude: userLocation.long }, { latitude: a.location.lat, longitude: a.location.long });
          const distB = getDistance({ latitude: userLocation.lat, longitude: userLocation.long }, { latitude: b.location.lat, longitude: b.location.long });
          return distA - distB;
        });
      }

      setFilteredCompanies(results);

      // Log lead (future: tie to user if authenticated)
      if (results.length > 0) {
        await supabase.from("leads").insert({
          query: `${service || "Any"} in ${region || "Any"}`,
          user_location: userLocation ? { lat: userLocation.lat, long: userLocation.long } : null,
        });
      }

      toast({ title: "Success", description: `${results.length} results found.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Invalid search parameters." });
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-foreground dark:text-white">Tradies Directory</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={service} onValueChange={setService}>
          <SelectTrigger>
            <SelectValue placeholder="Select Service" />
          </SelectTrigger>
          <SelectContent>
            {availableServices.map((svc) => (
              <SelectItem key={svc} value={svc}>
                {svc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger>
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent>
            {availableRegions.map((reg) => (
              <SelectItem key={reg} value={reg}>
                {reg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={searching}>
          {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {searching ? "Searching..." : "Search"}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground dark:text-gray-400">No results found. Try different filters.</p>
        ) : (
          filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))
        )}
      </div>
    </div>
  );
}
