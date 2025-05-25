// Supabase Edge Function for sending WhatsApp messages via WasenderAPI
// This function proxies requests to WasenderAPI and handles CORS
// Fixed authorization header issue and added API key validation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers to allow requests from the frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, replace with your specific domain
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Handle preflight requests for CORS
function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

// Validate API key format (simple validation)
function isValidApiKey(apiKey: string): boolean {
  // Basic validation - adjust based on actual WasenderAPI key format
  return typeof apiKey === 'string' && apiKey.trim().length > 0;
}

// Verify if the API key is valid by making a test request to WasenderAPI
async function verifyApiKey(apiKey: string): Promise<{isValid: boolean, message?: string}> {
  try {
    const response = await fetch("https://wasenderapi.com/api/account-info", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    
    const data = await response.json();
    return {
      isValid: response.ok,
      message: response.ok ? "API key is valid" : (data.error || data.message || "Invalid API key")
    };
  } catch (error) {
    return {
      isValid: false,
      message: `API key verification failed: ${error.message}`
    };
  }
}

// Main handler function
serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Only allow POST requests to this endpoint
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    const { apiKey, to, text, fileUrl, fileType, action } = requestData;

    // Validate required fields
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!isValidApiKey(apiKey)) {
      return new Response(
        JSON.stringify({ error: "Invalid API key format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If action is 'verify', just verify the API key and return the result
    if (action === 'verify') {
      const verification = await verifyApiKey(apiKey);
      return new Response(
        JSON.stringify(verification),
        {
          status: verification.isValid ? 200 : 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // For message sending, validate additional required fields
    if (!to) {
      return new Response(
        JSON.stringify({ error: "Recipient phone number is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!text && !fileUrl) {
      return new Response(
        JSON.stringify({ error: "Either message text or file URL is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare the request body for WasenderAPI
    const wasenderPayload: Record<string, any> = { to };
    
    // Add text if provided
    if (text) {
      wasenderPayload.text = text;
    }
    
    // Add file URL based on file type if provided
    if (fileUrl) {
      switch (fileType) {
        case 'image':
          wasenderPayload.imageUrl = fileUrl;
          break;
        case 'video':
          wasenderPayload.videoUrl = fileUrl;
          break;
        case 'document':
          wasenderPayload.documentUrl = fileUrl;
          break;
        default:
          // Default to document if type not specified
          wasenderPayload.documentUrl = fileUrl;
      }
    }

    // Make the request to WasenderAPI with proper authorization
    const wasenderResponse = await fetch("https://wasenderapi.com/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(wasenderPayload)
    });

    // Get the response from WasenderAPI
    const wasenderData = await wasenderResponse.json();
    
    // Return the WasenderAPI response to the client
    return new Response(
      JSON.stringify({
        ...wasenderData,
        success: wasenderResponse.ok
      }),
      {
        status: wasenderResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error in WhatsApp sender function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "An unexpected error occurred", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});