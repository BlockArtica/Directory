import { createServerClient } from "@/lib/supabaseServer";
import AdSpot from "@/components/AdSpot";
import ChatBox from "@/components/ChatBox";
import SearchBar from "@/components/SearchBar";
import NoticeBoard from "@/components/NoticeBoard";
import { Shield, Search, LayoutDashboard, Heart } from "lucide-react";
import { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tradies Directory — Find Trusted Tradies Near You",
  description: "Australia's community-backed directory connecting you with verified, local professionals.",
};

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Tradies",
    description: "Every business is reviewed and backed by real customers.",
  },
  {
    icon: Search,
    title: "Smart AI Search",
    description: "Describe your problem in plain English — we'll match the right trade.",
  },
  {
    icon: LayoutDashboard,
    title: "Business Dashboard",
    description: "Manage quotes, post jobs, book ads, and track analytics.",
  },
  {
    icon: Heart,
    title: "Seeker Tools",
    description: "Save favourites, request quotes, write reviews, and compare tradies.",
  },
];

export default async function HomePage() {
  const supabase = await createServerClient();
  const { data: ads, error: adsError } = await supabase
    .from("ads")
    .select("*")
    .eq("active", true)
    .order("spot", { ascending: true })
    .limit(3);

  if (adsError) {
    console.error("Failed to load ads:", adsError);
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 md:py-28">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Find Trusted Tradies Near You
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Australia&apos;s community-backed directory connecting you with verified, local professionals.
          </p>

          {/* Search Area */}
          <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto pt-4">
            <SearchBar />
            <ChatBox />
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center space-y-3"
              >
                <feature.icon className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AdSpots Section */}
      <section className="w-full bg-card dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">Featured Ads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((spot) => {
              const ad = ads?.find((a) => a.spot === spot);
              return <AdSpot key={spot} spot={spot} imageUrl={ad?.image_url} linkUrl={ad?.link_url} />;
            })}
          </div>
        </div>
      </section>

      {/* Notice Board Section */}
      <section className="w-full py-12">
        <div className="container mx-auto px-4">
          <NoticeBoard />
        </div>
      </section>
    </div>
  );
}
