"use client"; // Client-side for form interactions

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Shadcn Select
import { Button } from "@/components/ui/button"; // Shadcn Button
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react"; // For loading spinner
import { z } from "zod"; // For validation

// Zod schema for search filters
const searchSchema = z.object({
  service: z.string().optional(),
  region: z.string().optional(),
});

// Predefined options (align with DB; future from regions/services fetch)
const availableServices = ["Plumbing", "Electrical", "Carpentry", "Painting", "Landscaping", "Roofing"];
const availableRegions = ["Northern Beaches, NSW", "Brisbane, QLD"];

export default function SearchBar() {
  const [service, setService] = useState<string | undefined>(undefined);
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const validated = searchSchema.parse({ service, region });

      // Redirect to directory with params
      const searchParams = new URLSearchParams();
      if (validated.service) searchParams.append("service", validated.service);
      if (validated.region) searchParams.append("region", validated.region);
      router.push(`/directory?${searchParams.toString()}`);

      // Insert lead in background (don't block redirect)
      supabase.from("leads").insert({
        query: `${validated.service || "Any"} in ${validated.region || "Any"}`,
        user_location: null,
      });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Invalid search parameters." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 w-full max-w-md">
      <Select value={service} onValueChange={setService}>
        <SelectTrigger className="w-full md:w-auto bg-card dark:bg-gray-800">
          <SelectValue placeholder="Service" />
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
        <SelectTrigger className="w-full md:w-auto bg-card dark:bg-gray-800">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          {availableRegions.map((reg) => (
            <SelectItem key={reg} value={reg}>
              {reg}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {loading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
}
