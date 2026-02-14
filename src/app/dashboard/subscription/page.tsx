"use client"; // Client-side for Stripe interactions

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn Card
import { useToast } from "@/hooks/use-toast"; // Shadcn Toast hook
import { Loader2, CheckCircle } from "lucide-react"; // Icons for loading/success
// Stripe checkout is handled server-side via /api/create-checkout-session

// Tier definitions (align with DB check constraint)
const tiers = [
  {
    name: "Basic",
    price: 0,
    description: "Free listing with basic visibility.",
    features: ["Directory listing", "Basic search ranking", "Email support"],
    stripePriceId: null, // Free, no payment
  },
  {
    name: "Pro",
    price: 29,
    description: "Enhanced features for better leads.",
    features: ["Priority ranking", "Ad spots access", "Analytics dashboard", "Phone support"],
    stripePriceId: "price_12345ProMonthly", // Replace with actual Stripe Price ID
  },
  {
    name: "Enterprise",
    price: 99,
    description: "Full suite for high-volume businesses.",
    features: ["Top ranking", "Featured ads", "Custom integrations", "Dedicated account manager"],
    stripePriceId: "price_12345EnterpriseMonthly", // Replace with actual Stripe Price ID
  },
];

export default function SubscriptionPage() {
  const [currentTier, setCurrentTier] = useState<string>("basic");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("companies")
        .select("subscription_tier")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load subscription." });
      } else if (data) {
        setCurrentTier(data.subscription_tier);
      }
      setLoading(false);
    };
    fetchSubscription();
  }, []);

  const handleSelectTier = async (tierName: string, priceId: string | null) => {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      if (priceId) {
        // Paid tier: Create Stripe checkout session via server action
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, userId: session.user.id }),
        });

        const { url } = await response.json();
        if (!url) throw new Error("Failed to create checkout session");
        window.location.href = url;
      } else {
        // Free tier: Direct DB update
        const { error } = await supabase
          .from("companies")
          .update({ subscription_tier: tierName.toLowerCase(), subscription_id: null })
          .eq("user_id", session.user.id);

        if (error) throw error;

        setCurrentTier(tierName.toLowerCase());
        toast({ title: "Success", description: "Subscription updated to Basic!" });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Subscription update failed.";
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setSubmitting(false);
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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground dark:text-white">Manage Subscription</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`flex flex-col ${currentTier === tier.name.toLowerCase() ? "border-primary shadow-lg" : ""} bg-card dark:bg-gray-800`}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground dark:text-white">{tier.name}</CardTitle>
              <CardDescription className="text-muted-foreground dark:text-gray-300">
                ${tier.price}/month
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="mb-4 text-muted-foreground dark:text-gray-400">{tier.description}</p>
              <ul className="space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center text-foreground dark:text-white">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={currentTier === tier.name.toLowerCase() ? "secondary" : "default"}
                disabled={submitting || currentTier === tier.name.toLowerCase()}
                onClick={() => handleSelectTier(tier.name, tier.stripePriceId)}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {currentTier === tier.name.toLowerCase() ? "Current Plan" : "Select"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground dark:text-gray-400">
        Subscriptions powered by Stripe. Manage billing in your Stripe portal after upgrade.
      </p>
    </div>
  );
}
