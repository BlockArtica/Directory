"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getUser();

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

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
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-gray-300 hover:text-white" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              )}
            </Button>
          )}
          {!loading && user ? (
            <>
              <Link href="/dashboard" className="text-muted-foreground dark:text-gray-300 hover:text-primary">
                Dashboard
              </Link>
              <Button
                variant="ghost"
                className="text-muted-foreground dark:text-gray-300 hover:text-primary"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : !loading ? (
            <>
              <Link href="/auth/login" className="text-muted-foreground dark:text-gray-300 hover:text-primary">
                Login
              </Link>
              <Link href="/auth/signup">
                <Button variant="default">Sign Up</Button>
              </Link>
            </>
          ) : null}
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
            {mounted && (
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? (
                  <><Sun className="mr-2 h-4 w-4" /> Light Mode</>
                ) : (
                  <><Moon className="mr-2 h-4 w-4" /> Dark Mode</>
                )}
              </DropdownMenuItem>
            )}
            {!loading && user ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </>
            ) : !loading ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/auth/login">Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
