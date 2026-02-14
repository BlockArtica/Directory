"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import { createClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TierGate from "@/components/dashboard/TierGate";

interface AdBooking {
  id: string;
  spot: number;
  image_url: string;
  link_url: string;
  status: string;
  created_at: string;
}

interface ActiveAd {
  spot: number;
  active: boolean;
}

export default function AdBookingPage() {
  const { session, loading } = useSession();
  const [tier, setTier] = useState("basic");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<AdBooking[]>([]);
  const [activeAds, setActiveAds] = useState<ActiveAd[]>([]);
  const [fetching, setFetching] = useState(true);
  const [bookingSpot, setBookingSpot] = useState<number | null>(null);
  const [formData, setFormData] = useState({ image_url: "", link_url: "" });
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const { data: company } = await supabase
        .from("companies")
        .select("id, subscription_tier")
        .eq("user_id", session.user.id)
        .single();

      if (!company) {
        setFetching(false);
        return;
      }

      setCompanyId(company.id);
      setTier(company.subscription_tier || "basic");

      const [adsResult, bookingsResult] = await Promise.all([
        supabase.from("ads").select("spot, active").eq("active", true),
        supabase.from("ad_bookings").select("*").eq("company_id", company.id).order("created_at", { ascending: false }),
      ]);

      setActiveAds((adsResult.data || []) as ActiveAd[]);
      setBookings((bookingsResult.data || []) as AdBooking[]);
      setFetching(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || bookingSpot === null) return;

    if (!formData.image_url || !formData.link_url) {
      toast({ title: "Error", description: "Both image URL and link URL are required.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from("ad_bookings")
      .insert({
        company_id: companyId,
        spot: bookingSpot,
        image_url: formData.image_url,
        link_url: formData.link_url,
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: "Failed to submit booking request.", variant: "destructive" });
      return;
    }

    if (data) {
      setBookings((prev) => [data as AdBooking, ...prev]);
      setBookingSpot(null);
      setFormData({ image_url: "", link_url: "" });
      toast({ title: "Booking Submitted", description: "Your ad booking is pending admin approval." });
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const spots = [1, 2, 3];
  const takenSpots = activeAds.map((a) => a.spot);
  const myBookedSpots = bookings
    .filter((b) => b.status === "pending" || b.status === "approved")
    .map((b) => b.spot);

  const getSpotStatus = (spot: number) => {
    if (myBookedSpots.includes(spot)) return "yours";
    if (takenSpots.includes(spot)) return "taken";
    return "available";
  };

  return (
    <TierGate userTier={tier} requiredTier="pro">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Ad Spot Booking</h1>
        <p className="text-muted-foreground dark:text-gray-400">
          Book one of 3 homepage ad spots. Bookings require admin approval.
        </p>

        {/* Spot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {spots.map((spot) => {
            const status = getSpotStatus(spot);
            return (
              <Card key={spot} className="bg-card dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-foreground dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-primary" />
                      Spot {spot}
                    </span>
                    {status === "available" && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Available</Badge>
                    )}
                    {status === "taken" && (
                      <Badge variant="secondary">Taken</Badge>
                    )}
                    {status === "yours" && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Your Booking</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {status === "available" && bookingSpot !== spot && (
                    <Button size="sm" onClick={() => setBookingSpot(spot)}>
                      Request Booking
                    </Button>
                  )}
                  {status === "available" && bookingSpot === spot && (
                    <form onSubmit={handleBooking} className="space-y-3">
                      <div>
                        <Label htmlFor={`image-${spot}`}>Image URL</Label>
                        <Input
                          id={`image-${spot}`}
                          value={formData.image_url}
                          onChange={(e) => setFormData((f) => ({ ...f, image_url: e.target.value }))}
                          placeholder="https://..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`link-${spot}`}>Link URL</Label>
                        <Input
                          id={`link-${spot}`}
                          value={formData.link_url}
                          onChange={(e) => setFormData((f) => ({ ...f, link_url: e.target.value }))}
                          placeholder="https://..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={submitting}>
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Submit
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setBookingSpot(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Booking History */}
        {bookings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground dark:text-white">Your Booking History</h2>
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-card dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground dark:text-white">
                        Spot {booking.spot}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">
                        Submitted {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={booking.status === "approved" ? "default" : booking.status === "pending" ? "secondary" : "outline"}
                      className={booking.status === "approved" ? "bg-green-600 text-white" : ""}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TierGate>
  );
}
