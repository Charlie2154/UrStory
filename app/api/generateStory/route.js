export async function POST(req) {
  try {
    const { conversation, currentStory } = await req.json();

    if (!conversation || conversation.length === 0) {
      return Response.json({ error: "No conversation provided" }, { status: 400 });
    }

    // Debug: log the API key presence
    console.log("[generateStory] GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
    console.log("[generateStory] API Key starts with:", process.env.GEMINI_API_KEY?.slice(0, 10));

    // Optional: list available models for debugging once per cold start
    // (kept minimal to reduce noise in normal operation)

    // Extract the last user message
    const lastUserMessage = conversation[conversation.length - 1]?.text || "";
    const recentPoints = conversation
      .slice(Math.max(0, conversation.length - 6))
      .map((m) => (m?.text || "").trim())
      .filter(Boolean)
      .join("\n- ");

    // Create a focused prompt for grounded continuation AND a follow-up question
    const prompt = `You are a helpful story-writing assistant.

  Context:
  Current story so far:
  ${currentStory || "(empty)"}

  Recent chat notes (most recent last):
  - ${recentPoints}

  Latest instruction from the user:
  "${lastUserMessage}"

  Your tasks:
  1) Continue the same story using ONLY details present in the context or the user's messages. Don't invent new characters, places, or plot points unless explicitly asked. Prefer a natural Indian context if implied by names or setting. Keep language simple and real; match the story's POV and tense. Write 2–4 sentences.
  2) Ask ONE short, concrete follow-up question that will help you continue the story next (e.g., about feelings, setting details, dialogue, or next action). Keep the question under 20 words.

  Return a strict JSON object only, no extra text:
  {"story":"...","question":"..."}`;

    // Helper to call Gemini with a specific model and prompt
    async function callModel(model, text, cfg) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text }],
              },
            ],
            generationConfig: cfg,
          }),
        }
      );
      const json = await res.json().catch(() => ({}));
      console.log(`[generateStory] ${model} response:`, JSON.stringify(json, null, 2));
      const cand = json?.candidates?.[0];
      const p = cand?.content?.parts || [];
      let out = "";
      if (Array.isArray(p) && p.length) {
        out = p.map((pp) => (typeof pp.text === "string" ? pp.text : "")).join("").trim();
      }
      if (!out && typeof cand?.output_text === "string") out = cand.output_text.trim();
      return out;
    }

    // Try multiple stable models until we get text
    const models = [
      "gemini-2.5-pro",
      "gemini-flash-latest",
      "gemini-pro-latest",
      "gemini-2.0-flash",
    ];

    const cfg = { temperature: 0.5, topP: 0.9, topK: 40, maxOutputTokens: 384 };
    let storyText = "";
    let followUp = "";
    for (const m of models) {
      const out = await callModel(m, prompt, cfg);
      if (out) {
        // Try to parse strict JSON
        try {
          const match = out.match(/\{[\s\S]*\}/);
          const jsonStr = match ? match[0] : out;
          const obj = JSON.parse(jsonStr);
          storyText = (obj.story || "").trim();
          followUp = (obj.question || "").trim();
        } catch (_) {
          storyText = out;
        }
      }
      if (storyText) break;
    }
    // If still empty, retry models with a simpler prompt
    if (!storyText) {
      const retryPrompt = `Continue the story in 2–4 short, simple sentences that follow naturally. Only output the story text.

Story so far:
${currentStory || "(empty)"}

User said: "${lastUserMessage}".`;
      for (const m of models) {
        const out = await callModel(m, retryPrompt, { ...cfg, temperature: 0.45, maxOutputTokens: 320 });
        if (out) {
          storyText = out.trim();
          break;
        }
      }
    }

    if (!followUp) {
      followUp = "What should happen next? Any feelings, setting, or a line of dialogue?";
    }

    return Response.json({ storyText, followUp });
  } catch (error) {
    console.error("[generateStory] Error:", error.message);
    return Response.json(
      { error: error.message || "Failed to generate story" },
      { status: 500 }
    );
  }
}
