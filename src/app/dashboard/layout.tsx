import { createServerClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists (server version)
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button"; // Shadcn Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Shadcn DropdownMenu
import { LogOut, Menu, User, CreditCard } from "lucide-react"; // Icons for nav
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Tradies Directory",
  description: "Manage your profile and subscription.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const handleLogout = async () => {
    "use server"; // Server action for logout
    const supabase = createServerClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <header className="bg-card dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-foreground dark:text-white">
            Tradies Dashboard
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link href="/dashboard/profile" className="text-muted-foreground dark:text-gray-300 hover:text-primary">
              Profile
            </Link>
            <Link href="/dashboard/subscription" className="text-muted-foreground dark:text-gray-300 hover:text-primary">
              Subscription
            </Link>
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
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/subscription" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscription
                </Link>
              </DropdownMenuItem>
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
        © 2026 Tradies Directory
      </footer>
    </div>
  );
}
