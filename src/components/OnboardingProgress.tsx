"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useSession } from "@/lib/useSession";
import { CheckCircle, Circle } from "lucide-react";

interface CompanyData {
  name: string;
  abn: string;
  location: { address: string; lat: number; long: number; region: string };
  services: string[];
  subscription_tier: string;
}

export default function OnboardingProgress() {
  const { session } = useSession();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!session) return;

    const fetchCompany = async () => {
      const { data } = await supabase
        .from("companies")
        .select("name, abn, location, services, subscription_tier")
        .eq("user_id", session.user.id)
        .single();

      if (data) setCompany(data as CompanyData);
    };
    fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const step1Done = true; // Signed up (always true if viewing this)
  const step2Done = company
    ? company.name.length > 0 && company.abn.length > 0 && company.location?.address?.length > 0 && company.services?.length > 0
    : false;
  const step3Done = company ? company.subscription_tier !== "basic" : false;

  const steps = [
    { label: "Sign Up", done: step1Done },
    { label: "Complete Profile", done: step2Done },
    { label: "Choose Plan", done: step3Done },
  ];

  return (
    <div className="bg-card dark:bg-gray-800 rounded-lg p-4 shadow">
      <p className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-3">Getting Started</p>
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            {step.done ? (
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground dark:text-gray-500 shrink-0" />
            )}
            <span className={`text-sm ${step.done ? "text-foreground dark:text-white font-medium" : "text-muted-foreground dark:text-gray-400"}`}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px w-8 ${step.done ? "bg-primary" : "bg-muted-foreground/30"}`} />
            )}
          </div>
        ))}
      </div>
      {!step3Done && (
        <p className="text-xs text-muted-foreground dark:text-gray-500 mt-2">
          {!step2Done
            ? "Complete your profile to appear in the directory."
            : "Free plan active. Upgrade for better visibility."}
        </p>
      )}
    </div>
  );
}
