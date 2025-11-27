export async function POST(req) {
  try {
    const { conversation, currentStory } = await req.json();

    if (!conversation || conversation.length === 0) {
      return Response.json({ error: "No conversation provided" }, { status: 400 });
    }

    // Extract the last user message
    const lastUserMessage = conversation[conversation.length - 1]?.text || "";

    // Create a prompt for story generation
    const prompt = `You are a creative storyteller. The user is building a story through conversation.

Current story so far:
${currentStory}

User's latest input:
"${lastUserMessage}"

Based on this input, generate a natural continuation or enhancement to the story. Keep it:
- Engaging and narrative-driven
- Consistent with what came before
- 2-3 sentences maximum
- In the same tone and style

Generate ONLY the story text, nothing else.`;

    // Call OpenAI API (you can use any LLM API)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a creative storyteller who helps users write engaging stories through conversation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const storyText =
      data.choices[0]?.message?.content?.trim() || "Story update generated.";

    return Response.json({ storyText });
  } catch (error) {
    console.error("Error generating story:", error);
    return Response.json(
      { error: error.message || "Failed to generate story" },
      { status: 500 }
    );
  }
}
