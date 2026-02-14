import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0"; // Latest Resend SDK for Deno

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { company_id, company_name } = await req.json();

    if (!company_id || !company_name) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Send email to admin
    const { data, error } = await resend.emails.send({
      from: "Tradies Directory <notify@yourdomain.com>", // Replace with verified domain
      to: Deno.env.get("ADMIN_EMAIL") || "your_admin_email@example.com",
      subject: "New Profile Pending Approval",
      html: `
        <p>A new company profile is awaiting approval:</p>
        <p><strong>Name:</strong> ${company_name}</p>
        <p><strong>ID:</strong> ${company_id}</p>
        <p>Review in admin dashboard: <a href="https://yourapp.com/admin">Admin Queue</a></p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response("Failed to send notification", { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error("Function error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
