import { createServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Shadcn Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Shadcn DropdownMenu
import { Menu, LogOut } from "lucide-react"; // Icons for menu/logout

export default async function Header() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const handleLogout = async () => {
    "use server";
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  };

  // Map user to session-like shape for template compatibility
  const session = user ? { user } : null;

  return (
    <header className="bg-card dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-foreground dark:text-white">
          Tradies Directory
        </Link>
        <nav className="hidden md:flex space-x-4 items-center">
          <Link href="/directory" className="text-muted-foreground dark:text-gray-300 hover:text-primary">
            Directory
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-muted-foreground dark:text-gray-300 hover:text-primary">
                Dashboard
              </Link>
              <form action={handleLogout}>
                <Button variant="ghost" className="text-muted-foreground dark:text-gray-300 hover:text-primary">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-muted-foreground dark:text-gray-300 hover:text-primary">
                Login
              </Link>
              <Link href="/auth/signup">
                <Button variant="default">Sign Up</Button>
              </Link>
            </>
          )}
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
              <Link href="/directory">Directory</Link>
            </DropdownMenuItem>
            {session ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <form action={handleLogout} className="w-full">
                    <button type="submit" className="flex items-center w-full text-left">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </button>
                  </form>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/auth/login">Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
