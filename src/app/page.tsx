import { createServerClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists (server version)
import AdSpot from "@/components/AdSpot"; // Assumes components/AdSpot.tsx exists
import ChatBox from "@/components/ChatBox"; // Assumes components/ChatBox.tsx exists
import SearchBar from "@/components/SearchBar"; // Assumes components/SearchBar.tsx exists
import NoticeBoard from "@/components/NoticeBoard"; // Assumes components/NoticeBoard.tsx exists
import { Metadata } from "next";

// Revalidate on load for fresh ads/jobs
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Home | Tradies Directory",
  description: "100% AI-Powered Tradies Directory – NEXT Level TECH for Connecting Businesses and Skilled Workers in Australia.",
};

export default async function HomePage() {
  const supabase = createServerClient();
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
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900 text-foreground dark:text-white">
      {/* Hero Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
      
      <div className="relative z-10 container mx-auto px-4 py-16 text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold">100% AI-Powered Tradies Directory</h1>
        <h2 className="text-2xl md:text-4xl font-semibold">NEXT Level TECH for Connecting Skilled Workers and Businesses in Australia</h2>
        <p className="text-xl md:text-2xl text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
          Discover verified tradies, post job opportunities, and leverage AI for smart searches. Built for efficiency, scalability, and national expansion starting from Brisbane.
        </p>
        
        {/* SearchBar and ChatBox */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
          <SearchBar />
          <ChatBox />
        </div>
      </div>
      
      {/* AdSpots Section */}
      <div className="relative z-10 w-full bg-card dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-center">Featured Ads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((spot) => {
              const ad = ads?.find((a) => a.spot === spot);
              return <AdSpot key={spot} spot={spot} imageUrl={ad?.image_url} linkUrl={ad?.link_url} />;
            })}
          </div>
        </div>
      </div>
      
      {/* Notice Board Section */}
      <div className="relative z-10 w-full py-8">
        <div className="container mx-auto px-4">
          <NoticeBoard />
        </div>
      </div>
    </div>
  );
}
