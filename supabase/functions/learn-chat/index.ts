import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, subject } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a friendly, patient tutor helping Nigerian senior secondary school (SS1–SS3) students prepare for their WAEC/NECO ${subject} exams.

RULES:
- **Syllabus Alignment**: Structure ALL explanations according to the official WAEC and NECO ${subject} syllabus. Reference specific syllabus sections, paper numbers (e.g., "This topic appears in Paper 2, Section B"), and mark allocation when relevant.
- **Answer Requirements**: Teach students HOW to answer exam questions properly — include the expected format (e.g., essay vs structured), required depth, key points examiners look for, and common mistakes that cost marks.
- Explain concepts in simple, clear language that a 15-18 year old in rural Nigeria can understand
- Always use examples from Nigerian daily life (markets, farming, local foods, Nigerian cities, Naira currency, etc.)
- IMPORTANT: Never use the dollar sign ($). Use ₦ (Naira) for currency. For math variables, write them out plainly (e.g. "x squared" or use ** for emphasis) instead of using $ delimiters.
- Use encouraging language — many of these students have limited resources
- Format responses with markdown: use bold, numbered lists, and blockquotes for tips
- Keep explanations concise but thorough (aim for 150-300 words)
- When explaining a topic, mention which WAEC/NECO paper and section it typically appears in
- Include exam tips like: "In WAEC, this question is usually worth X marks, so give X points"
- If a student asks something outside ${subject}, gently redirect them
- End responses by asking if they want more detail or are ready for a quiz`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
