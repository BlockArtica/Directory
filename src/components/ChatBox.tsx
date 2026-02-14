"use client"; // Client-side for AI interactions

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import OpenAI from "openai";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";

// Zod schema for AI-parsed output
const parsedQuerySchema = z.object({
  service: z.string().optional(),
  region: z.string().optional(),
});

// Toggle: set NEXT_PUBLIC_ENABLE_AI=true in .env.local to use GPT
const AI_ENABLED = process.env.NEXT_PUBLIC_ENABLE_AI === "true";

// OpenAI client — only created when AI is enabled and key exists
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const openai = AI_ENABLED && apiKey ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true }) : null;

// Keyword mappings for fallback mode — maps common phrases to services
const SERVICE_KEYWORDS: Record<string, string[]> = {
  Plumbing: ["plumber", "plumbing", "pipe", "pipes", "tap", "taps", "toilet", "drain", "drains", "blocked drain", "hot water", "water heater", "leak", "leaking", "leaky", "sewer", "sewage", "gas fitting", "gas fitter", "bathroom", "shower", "burst pipe", "water pressure", "cistern", "faucet"],
  Electrical: ["electrician", "electrical", "electric", "wiring", "rewire", "power point", "power points", "switchboard", "lighting", "lights", "ceiling fan", "smoke alarm", "safety switch", "solar", "solar panel", "ev charger", "data cabling", "nbn", "fuse", "circuit breaker", "blackout", "power outage"],
  Carpentry: ["carpenter", "carpentry", "timber", "wood", "deck", "decking", "pergola", "wardrobe", "joinery", "cabinet", "cabinets", "shelving", "framing", "renovation", "reno", "extension", "builder", "building"],
  Painting: ["painter", "painting", "paint", "repaint", "interior painting", "exterior painting", "wall", "walls", "colour", "color", "dulux", "render", "rendering", "spray paint", "touch up"],
  Landscaping: ["landscaper", "landscaping", "garden", "gardener", "gardening", "lawn", "mowing", "turf", "retaining wall", "paving", "irrigation", "hedge", "hedging", "tree", "tree removal", "mulch", "yard", "backyard", "outdoor"],
  Roofing: ["roofer", "roofing", "roof", "gutter", "gutters", "guttering", "fascia", "downpipe", "tile", "tiles", "colorbond", "roof leak", "roof repair", "storm damage", "slate"],
};

const REGION_KEYWORDS: Record<string, string[]> = {
  "Northern Beaches, NSW": ["northern beaches", "manly", "dee why", "brookvale", "freshwater", "curl curl", "narrabeen", "mona vale", "newport", "avalon", "palm beach", "collaroy", "warriewood", "fairlight", "balgowlah", "seaforth", "north shore", "sydney north"],
  "Brisbane, QLD": ["brisbane", "qld", "queensland", "fortitude valley", "west end", "south brisbane", "new farm", "bulimba", "woolloongabba", "chermside", "albion", "gold coast", "southside", "northside"],
};

function fallbackParse(query: string): { service?: string; region?: string } {
  const lower = query.toLowerCase();

  // Match service by scanning all keywords
  let matchedService: string | undefined;
  let bestServiceScore = 0;
  for (const [service, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword) && keyword.length > bestServiceScore) {
        matchedService = service;
        bestServiceScore = keyword.length; // Prefer longer (more specific) matches
      }
    }
  }

  // Match region by scanning all keywords
  let matchedRegion: string | undefined;
  let bestRegionScore = 0;
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword) && keyword.length > bestRegionScore) {
        matchedRegion = region;
        bestRegionScore = keyword.length;
      }
    }
  }

  return { service: matchedService, region: matchedRegion };
}

const PLACEHOLDER_EXAMPLES = [
  "My hot water system broke down...",
  "Need a deck built in my backyard...",
  "Looking for a licensed electrician...",
  "Roof tiles damaged after the storm...",
  "Garden needs a complete makeover...",
];

export default function ChatBox() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      let validated: { service?: string; region?: string };

      if (openai) {
        // GPT mode: understands natural language like "my hot water is broken"
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a smart search assistant for an Australian tradies directory. Parse the user's query into a JSON object with:
- "service": the trade category needed. Must be one of: Plumbing, Electrical, Carpentry, Painting, Landscaping, Roofing. Infer from context — e.g. "hot water broken" = Plumbing, "lights flickering" = Electrical, "deck needs fixing" = Carpentry, "walls need a fresh coat" = Painting, "backyard is a mess" = Landscaping, "roof is leaking" = Roofing.
- "region": the closest region. Must be one of: "Northern Beaches, NSW", "Brisbane, QLD". Infer from suburbs — e.g. "Manly" = "Northern Beaches, NSW", "West End" = "Brisbane, QLD". If no location mentioned, omit.
Only return valid JSON. If you can't determine a field, omit it.`,
            },
            { role: "user", content: query },
          ],
          response_format: { type: "json_object" },
        });

        const parsed = JSON.parse(completion.choices[0].message.content || "{}");
        validated = parsedQuerySchema.parse(parsed);
      } else {
        // Fallback: smart keyword matching
        validated = fallbackParse(query);
      }

      // Redirect to directory with params
      const searchParams = new URLSearchParams();
      if (validated.service) searchParams.append("service", validated.service);
      if (validated.region) searchParams.append("region", validated.region);
      router.push(`/directory?${searchParams.toString()}`);

      toast({ title: "Success", description: `Found: ${validated.service || "All services"}${validated.region ? ` in ${validated.region}` : ""}` });

      // Insert lead in background (don't block redirect)
      supabase.from("leads").insert({ query, user_location: null });
    } catch (error) {
      console.error("ChatBox error:", error);
      const message = error instanceof Error ? error.message : "Failed to process query. Try again.";
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl items-end space-x-2">
      <Textarea
        placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={3}
        className="flex-grow bg-card dark:bg-gray-800 resize-none"
        disabled={loading}
      />
      <Button type="submit" disabled={loading} className="h-auto py-3">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : openai ? "Ask AI" : "Search"}
      </Button>
    </form>
  );
}
