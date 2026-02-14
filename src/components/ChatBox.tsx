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

// OpenAI client (key from env)
const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

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
      // AI parsing: Prompt OpenAI to extract service/region from natural query
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Efficient model for parsing
        messages: [
          { role: "system", content: "Parse the user query into a JSON object with 'service' (e.g., Plumbing) and 'region' (e.g., Brisbane, QLD). Use available services: Plumbing, Electrical, Carpentry, Painting, Landscaping, Roofing. If unclear, use defaults or omit." },
          { role: "user", content: query },
        ],
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(completion.choices[0].message.content || "{}");
      const validated = parsedQuerySchema.parse(parsed);

      // Get user location if available (for leads)
      let userLocation: { lat: number; long: number } | null = null;
      if (navigator.geolocation) {
        userLocation = await new Promise<{ lat: number; long: number } | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, long: pos.coords.longitude }),
            () => resolve(null)
          );
        });
      }

      // Insert lead
      await supabase.from("leads").insert({
        query,
        user_location: userLocation ? { lat: userLocation.lat, long: userLocation.long } : null,
      });

      // Redirect to directory with params
      const searchParams = new URLSearchParams();
      if (validated.service) searchParams.append("service", validated.service);
      if (validated.region) searchParams.append("region", validated.region);
      router.push(`/directory?${searchParams.toString()}`);

      toast({ title: "Success", description: "Query processed—redirecting to results." });
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
