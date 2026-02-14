import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Optional font; remove if not needed
import "./globals.css"; // Global styles (create src/app/globals.css next)
import Header from "@/components/Header"; // Assumes components/Header.tsx exists
import Footer from "@/components/Footer"; // Assumes components/Footer.tsx exists
import { Toaster } from "@/components/ui/toaster"; // Shadcn Toaster for global notifications

const inter = Inter({ subsets: ["latin"] }); // Optional: For consistent typography

export const metadata: Metadata = {
  title: "Tradies Directory",
  description: "Find and connect with verified tradies in Australia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
  <html lang="en" className="dark"><body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}>
    <Header />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
    <Toaster /> {/* Global toast container */}
  </body></html>
);
}

