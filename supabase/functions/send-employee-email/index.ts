import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  name: string;
  email: string;
  employeeId: string;
  department: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, employeeId, department, timestamp }: EmailRequest = await req.json();

    // Call your n8n webhook
    const n8nWebhookUrl = "http://localhost:5678/webhook/send-employee-email";
    
    const payload = {
      name,
      email,
      employeeId,
      department,
      timestamp
    };

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa("admin:securepassword123"),
        "Content-Type": "application/json",
        "X-Request-Source": "employee-manager"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);