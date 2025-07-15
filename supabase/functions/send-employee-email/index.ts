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

    console.log('Received email request:', { name, email, employeeId, department, timestamp });

    // For now, we'll simulate the email sending since localhost:5678 isn't accessible from edge functions
    // You'll need to replace this with your actual n8n webhook URL or use a different email service
    
    // Simulate successful email sending
    console.log('Email would be sent with payload:', {
      name,
      email,
      employeeId,
      department,
      timestamp
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email request processed successfully",
        payload: { name, email, employeeId, department, timestamp }
      }),
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