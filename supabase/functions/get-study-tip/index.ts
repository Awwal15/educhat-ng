import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subjectId, subjectName } = await req.json();
    if (!subjectId || !subjectName || typeof subjectId !== "string" || typeof subjectName !== "string") {
      return new Response(JSON.stringify({ error: "subjectId and subjectName are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Return cached tip if it exists (fast path for 2G)
    const { data: existing } = await supabase
      .from("study_tips")
      .select("tip")
      .eq("subject_id", subjectId)
      .maybeSingle();

    if (existing?.tip) {
      return new Response(JSON.stringify({ tip: existing.tip, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate once with AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a WAEC/NECO exam coach for Nigerian SS1-SS3 students.
Give a short "Study Tip" for ${subjectName} based on the topics where most WAEC/NECO candidates lose marks in this subject.
RULES: Simple language for rural Nigerian teens. Nigerian context, use ₦ never $. Markdown with 3-4 bullet points only. Each bullet: the weak topic + why students fail it + one concrete study strategy. Max 100 words total. No intro, no outro — bullets only.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "google/gemini-2.5-flash-lite",
        max_tokens: 400,
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      const msg = status === 429
        ? "Too many requests. Please try again shortly."
        : status === 402
          ? "AI service credits exhausted. Please try again later."
          : "AI service error";
      return new Response(JSON.stringify({ error: msg }), {
        status: status === 429 || status === 402 ? status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const tip: string | undefined = aiJson.choices?.[0]?.message?.content?.trim();
    if (!tip) throw new Error("Empty AI response");

    // Cache it — ignore race (another request may have inserted first)
    await supabase.from("study_tips").upsert(
      { subject_id: subjectId, subject_name: subjectName, tip },
      { onConflict: "subject_id" }
    );

    return new Response(JSON.stringify({ tip, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-tip error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
