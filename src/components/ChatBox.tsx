"use client"; // Client-side for AI interactions

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists
import OpenAI from "openai"; // For AI parsing
import { Input } from "@/components/ui/input"; // Shadcn Input
import { Button } from "@/components/ui/button"; // Shadcn Button
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react"; // For loading spinner
import { z } from "zod"; // For validation

// Zod schema for AI-parsed output
const parsedQuerySchema = z.object({
  service: z.string().optional(),
  region: z.string().optional(),
});

// Available services for keyword matching fallback
const availableServices = ["Plumbing", "Electrical", "Carpentry", "Painting", "Landscaping", "Roofing"];
const availableRegions = ["Northern Beaches, NSW", "Brisbane, QLD"];

// OpenAI client (key from env) - optional, falls back to keyword matching
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true }) : null;

export default function ChatBox() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      let validated: { service?: string; region?: string };

      if (openai) {
        // AI parsing via OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Parse the user query into a JSON object with 'service' (e.g., Plumbing) and 'region' (e.g., Brisbane, QLD). Use available services: Plumbing, Electrical, Carpentry, Painting, Landscaping, Roofing. If unclear, use defaults or omit." },
            { role: "user", content: query },
          ],
          response_format: { type: "json_object" },
        });

        const parsed = JSON.parse(completion.choices[0].message.content || "{}");
        validated = parsedQuerySchema.parse(parsed);
      } else {
        // Fallback: simple keyword matching
        const lowerQuery = query.toLowerCase();
        const matchedService = availableServices.find((s) => lowerQuery.includes(s.toLowerCase()));
        const matchedRegion = availableRegions.find((r) => lowerQuery.includes(r.split(",")[0].toLowerCase()));
        validated = { service: matchedService, region: matchedRegion };
      }

      // Redirect to directory with params
      const searchParams = new URLSearchParams();
      if (validated.service) searchParams.append("service", validated.service);
      if (validated.region) searchParams.append("region", validated.region);
      router.push(`/directory?${searchParams.toString()}`);

      toast({ title: "Success", description: "Query processed—redirecting to results." });

      // Insert lead in background (don't block redirect)
      supabase.from("leads").insert({ query, user_location: null });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to process query. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center space-x-2">
      <Input
        type="text"
        placeholder="Ask AI: e.g., Find electricians in Northern Beaches"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow bg-card dark:bg-gray-800"
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Chat"}
      </Button>
    </form>
  );
}
