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
import { LogOut, Menu, User, CreditCard, Heart, Search, Eye, MessageSquare, Star } from "lucide-react";
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

  const handleLogout = async () => {
    "use server";
    const supabase = await createServerClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  };

  const businessNav = [
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  ];

  const seekerNav = [
    { href: "/dashboard/favourites", label: "Favourites", icon: Heart },
    { href: "/dashboard/saved-searches", label: "Saved Searches", icon: Search },
    { href: "/dashboard/recent-views", label: "Recent Views", icon: Eye },
    { href: "/dashboard/quotes", label: "Quotes", icon: MessageSquare },
    { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  ];

  const navItems = userType === "business" ? businessNav : seekerNav;

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <header className="bg-card dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-foreground dark:text-white">
            Tradies Dashboard
          </Link>
          <nav className="hidden md:flex space-x-4 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground dark:text-gray-300 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <form action={handleLogout}>
              <Button variant="ghost" className="text-muted-foreground dark:text-gray-300 hover:text-primary">
                Logout
              </Button>
            </form>
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
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
