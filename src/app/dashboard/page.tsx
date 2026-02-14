"use client"; // Client-side for potential interactions

import { useSession } from "@/lib/useSession"; // Assumes lib/useSession.ts exists
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn Card
import { Loader2 } from "lucide-react"; // For loading spinner
import { useToast } from "@/hooks/use-toast"; // Shadcn Toast hook
import Link from "next/link";

// Simple dashboard home (welcome, links to profile/subscription)
export default function DashboardPage() {
  const { session, loading } = useSession();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    toast({ variant: "destructive", title: "Error", description: "Session not found. Please log in." });
    return null; // Layout will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-foreground dark:text-white">Welcome to Your Dashboard, {session.user.email}</h1>
      <p className="text-muted-foreground dark:text-gray-300">Manage your profile, subscription, and more.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card dark:bg-gray-800 rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground dark:text-white">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground dark:text-gray-400">Complete or update your company details.</p>
            <Button asChild variant="default" className="mt-4">
              <Link href="/dashboard/profile">Go to Profile</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-card dark:bg-gray-800 rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground dark:text-white">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground dark:text-gray-400">Manage your tier and payments.</p>
            <Button asChild variant="default" className="mt-4">
              <Link href="/dashboard/subscription">Go to Subscription</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
