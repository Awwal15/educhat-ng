import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a WAEC/NECO/JAMB past question quiz generator for Nigerian secondary school students.
Generate exactly 5 multiple-choice questions about the given topic in ${subject}.

CRITICAL RULES:
- Questions MUST be modeled after actual WAEC, NECO, and JAMB past questions in style, wording, and difficulty
- Use the exact phrasing style of these exams (e.g., "Which of the following...", "The process by which...", "Calculate the...")
- Questions should reflect the WAEC/NECO syllabus for SS1-SS3
- Use Nigerian context where possible (Naira, Nigerian cities, local examples, Nigerian historical figures)
- Each question must have exactly 4 options (A-D) — distractors should be realistic, as in actual past papers
- Provide a clear, educational explanation for each correct answer, referencing the syllabus topic
- Vary difficulty: 2 easy (typical NECO standard), 2 medium (WAEC standard), 1 hard (JAMB/competitive level)
- Where applicable, mention which exam year or paper the question style is drawn from (e.g., "Similar to WAEC 2019 Paper 1")`;

    const userPrompt = `Generate a quiz about: ${topic || subject}. Base the questions on WAEC, NECO, and JAMB past question patterns. Return the questions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Generate a WAEC-style quiz with 5 multiple choice questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        question: { type: "string" },
                        options: { type: "array", items: { type: "string" } },
                        correctIndex: { type: "number", description: "0-based index of the correct option" },
                        explanation: { type: "string" },
                      },
                      required: ["id", "question", "options", "correctIndex", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Quiz AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to generate quiz" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const quizData = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(quizData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to parse quiz" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
