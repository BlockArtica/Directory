import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-card dark:bg-gray-800 py-4 text-center text-sm text-muted-foreground dark:text-gray-400">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-4">
          <p>&copy; 2026 Tradies Directory. All rights reserved.</p>
          <nav className="flex space-x-4">
            <Link href="/directory" className="hover:underline">Directory</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
