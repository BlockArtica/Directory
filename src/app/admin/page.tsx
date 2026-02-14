import { createServerClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists (server version)
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button"; // Shadcn Button
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Shadcn Table
import { useToast } from "@/components/ui/use-toast"; // Shadcn Toast hook (client-side)
import { Loader2, Check, X } from "lucide-react"; // Icons for loading/approve/reject
import { Metadata } from "next";

// Revalidate on load for fresh data
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin | Tradies Directory",
  description: "Approval queue for company profiles.",
};

export default async function AdminPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/auth/login"); // Protect route
  }

  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .eq("verified", false)
    .order("created_at", { ascending: false });

  if (error) {
    // Handle error server-side; client toasts not available here
    return <div className="text-destructive">Error loading queue: {error.message}</div>;
  }

  const handleApprove = async (companyId: string) => {
    "use server";
    const supabase = createServerClient();
    const { error } = await supabase
      .from("companies")
      .update({ verified: true })
      .eq("id", companyId);

    if (error) throw error;
    // Future: Trigger notification to user via Resend
  };

  const handleReject = async (companyId: string) => {
    "use server";
    const supabase = createServerClient();
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", companyId);

    if (error) throw error;
    // Future: Trigger rejection email
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 bg-background dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-foreground dark:text-white">Admin Approval Queue</h1>
      {companies.length === 0 ? (
        <p className="text-muted-foreground dark:text-gray-400">No pending approvals.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-full bg-card dark:bg-gray-800 rounded-lg shadow">
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground dark:text-gray-300">Company Name</TableHead>
                <TableHead className="text-muted-foreground dark:text-gray-300">ABN</TableHead>
                <TableHead className="text-muted-foreground dark:text-gray-300">Location</TableHead>
                <TableHead className="text-muted-foreground dark:text-gray-300">Services</TableHead>
                <TableHead className="text-muted-foreground dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium text-foreground dark:text-white">{company.name}</TableCell>
                  <TableCell className="text-foreground dark:text-white">{company.abn}</TableCell>
                  <TableCell className="text-foreground dark:text-white">{company.location.address}</TableCell>
                  <TableCell className="text-foreground dark:text-white">{company.services.join(", ")}</TableCell>
                  <TableCell className="flex space-x-2">
                    <form action={() => handleApprove(company.id)}>
                      <Button variant="default" size="sm">
                        <Check className="mr-1 h-4 w-4" /> Approve
                      </Button>
                    </form>
                    <form action={() => handleReject(company.id)}>
                      <Button variant="destructive" size="sm">
                        <X className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
