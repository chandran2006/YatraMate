import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { from, to } = await req.json();
    if (!from || !to) throw new Error("Both 'from' and 'to' are required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a transport estimation assistant for Indian travel. Given an origin and destination, provide realistic travel estimates for different transport modes. Return ONLY valid JSON (no markdown) in this exact format:
{
  "routes": [
    { "mode": "Flight", "duration": "2h 30m", "cost": "₹4,500–₹12,000", "distance": "1,450 km" },
    { "mode": "Train", "duration": "6h 15m", "cost": "₹800–₹2,500", "distance": "980 km" },
    { "mode": "Bus", "duration": "8h 45m", "cost": "₹500–₹1,500", "distance": "1,020 km" },
    { "mode": "Car", "duration": "5h 30m", "cost": "₹2,000–₹4,000", "distance": "950 km" }
  ]
}
Only include transport modes that are realistically available between the two locations. Costs should be in Indian Rupees (₹). Be realistic with times and distances.`,
          },
          {
            role: "user",
            content: `Estimate transport options from "${from}" to "${to}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse transport estimates");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("transport-estimate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
