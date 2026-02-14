import { createServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut, Menu, User, CreditCard, Heart, Search, Eye, MessageSquare, Star,
  LayoutDashboard, Briefcase, Megaphone, Share2, BarChart3, Lock,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Tradies Directory",
  description: "Manage your profile and subscription.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile for nav bifurcation
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  const userType = profile?.user_type || "business";

  // Fetch company tier for business nav gating
  let companyTier = "basic";
  if (userType === "business") {
    const { data: company } = await supabase
      .from("companies")
      .select("subscription_tier")
      .eq("user_id", user.id)
      .single();
    companyTier = company?.subscription_tier || "basic";
  }

  const handleLogout = async () => {
    "use server";
    const supabase = await createServerClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  };

  const tierLevel = { basic: 0, pro: 1, enterprise: 2 }[companyTier] ?? 0;

  const businessNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, locked: false },
    { href: "/dashboard/preview", label: "Public Profile", icon: Eye, locked: false },
    { href: "/dashboard/profile", label: "Edit Profile", icon: User, locked: false },
    { href: "/dashboard/received-reviews", label: "Reviews", icon: Star, locked: false },
    { href: "/dashboard/received-quotes", label: "Quotes", icon: MessageSquare, locked: false },
    { href: "/dashboard/post-job", label: "Post Job", icon: Briefcase, locked: false },
    { href: "/dashboard/ad-booking", label: "Ad Spots", icon: Megaphone, locked: tierLevel < 1 },
    { href: "/dashboard/fb-post", label: "FB Post", icon: Share2, locked: tierLevel < 1 },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, locked: tierLevel < 2 },
    { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard, locked: false },
  ];

  const seekerNav = [
    { href: "/dashboard/favourites", label: "Favourites", icon: Heart, locked: false },
    { href: "/dashboard/saved-searches", label: "Saved Searches", icon: Search, locked: false },
    { href: "/dashboard/recent-views", label: "Recent Views", icon: Eye, locked: false },
    { href: "/dashboard/quotes", label: "Quotes", icon: MessageSquare, locked: false },
    { href: "/dashboard/reviews", label: "Reviews", icon: Star, locked: false },
  ];

  const navItems = userType === "business" ? businessNav : seekerNav;

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <header className="bg-card dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-foreground dark:text-white">
            Tradies Dashboard
          </Link>
          <nav className="hidden lg:flex space-x-3 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground dark:text-gray-300 hover:text-primary flex items-center gap-1"
              >
                {item.label}
                {item.locked && <Lock className="h-3 w-3 text-muted-foreground/50" />}
              </Link>
            ))}
            <form action={handleLogout}>
              <Button variant="ghost" className="text-muted-foreground dark:text-gray-300 hover:text-primary">
                Logout
              </Button>
            </form>
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-foreground dark:text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card dark:bg-gray-800">
              <DropdownMenuLabel className="text-foreground dark:text-white">Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {item.locked && <Lock className="ml-auto h-3 w-3 text-muted-foreground/50" />}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={handleLogout} className="w-full">
                  <button type="submit" className="flex items-center w-full text-left">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-card dark:bg-gray-800 py-4 text-center text-muted-foreground dark:text-gray-400">
        &copy; 2026 Tradies Directory
      </footer>
    </div>
  );
}
