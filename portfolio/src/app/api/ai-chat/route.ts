export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response('AI not configured.', { status: 503 });
    }

    // Fetch system prompt from Supabase REST (no SDK needed — works on Edge)
    let systemPrompt = `You are an AI assistant for Rafsan Jani's portfolio. Answer questions about Rafsan's background, projects, and skills based on this profile:

Name: Rafsan Jani. Engineering Aspirant, CS student.
Education: HSC GPA 5.00/5.00 — Rajshahi Cadet College. 17th on National Merit List (top 0.01%).
Leadership: College Prefect — managed 297 cadets. Best All-Round Cadet. ISSB Green Card.
Skills: Python, C/C++, Flask, HTML/CSS, Arduino, Raspberry Pi, ESP32, Adobe Suite, GitHub.
Projects: AgriBase (Bronze Medal, Innovation World Cup BD), CERN Beamline for Schools experiment, HAYTHAM X ONE solar/AI energy system, DCMD water purification.
Awards: IYMC Silver Honor 2024, BdJSO National Winner 2020, TIB Anti-Corruption 1st Place 2022, IAAC Qualifier 2022.
Contact: rafsan2972jani@gmail.com | Dinajpur, Bangladesh.
For anything outside this profile say: "I can't speak to that — email rafsan2972jani@gmail.com directly."`;

    // Try to fetch live knowledge from Supabase (non-blocking)
    try {
      const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (sbUrl && sbKey) {
        const kbRes = await fetch(
          `${sbUrl}/rest/v1/pf_ai_knowledge?id=eq.1&select=system_prompt_text`,
          {
            headers: {
              apikey: sbKey,
              Authorization: `Bearer ${sbKey}`,
            },
          }
        );
        if (kbRes.ok) {
          const kbData = await kbRes.json();
          if (kbData?.[0]?.system_prompt_text) {
            systemPrompt = kbData[0].system_prompt_text;
          }
        }
      }
    } catch {
      // Use fallback prompt — don't fail the whole request
    }

    // Build Gemini API request
    // Map our message format to Gemini's format
    const geminiHistory = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const lastUserMessage = messages[messages.length - 1].content;

    const geminiBody = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [
        ...geminiHistory,
        { role: 'user', parts: [{ text: lastUserMessage }] },
      ],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.7,
        topP: 0.9,
      },
    };

    // Use streaming endpoint
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(geminiBody),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errText);
      return new Response(`AI error: ${geminiRes.status}`, { status: 502 });
    }

    // Stream the SSE response back as plain text
    const stream = new ReadableStream({
      async start(controller) {
        const reader  = geminiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer    = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const text   = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) controller.enqueue(new TextEncoder().encode(text));
            } catch {
              // Skip malformed chunks
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type':  'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (err) {
    console.error('AI route error:', err);
    return new Response('Server error.', { status: 500 });
  }
}
