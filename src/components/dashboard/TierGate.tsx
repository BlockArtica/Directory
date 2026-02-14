"use client";

import { hasTierAccess, type SubscriptionTier } from "@/lib/tierGating";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

interface TierGateProps {
  userTier: SubscriptionTier | string;
  requiredTier: SubscriptionTier;
  children: React.ReactNode;
}

export default function TierGate({ userTier, requiredTier, children }: TierGateProps) {
  if (hasTierAccess(userTier, requiredTier)) {
    return <>{children}</>;
  }

  return (
    <Card className="bg-card dark:bg-gray-800 border-dashed border-2 border-muted-foreground/30">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Lock className="h-10 w-10 text-muted-foreground dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">
          {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}+ Feature
        </h3>
        <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 max-w-sm">
          This feature requires a {requiredTier} subscription or higher. Upgrade your plan to unlock it.
        </p>
        <Button asChild>
          <Link href="/dashboard/subscription">Upgrade Now</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
