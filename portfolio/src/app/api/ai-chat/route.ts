export const runtime = 'edge';
export const maxDuration = 30;

// Models to try in order — free tier may not have 2.0-flash yet
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
];

async function tryGemini(apiKey: string, model: string, body: object): Promise<Response | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (res.ok) return res;
  // 404 = model not found, try next. Other errors = bail
  if (res.status === 404) return null;
  // 400 / 429 / 500 — return as-is so we can report it
  return res;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        'AI not configured. Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local',
        { status: 503 }
      );
    }

    // ── Fetch knowledge base ──────────────────────────────────────────────
    let systemPrompt = `You are an AI assistant for Rafsan Jani's portfolio. Answer concisely and helpfully.

PROFILE:
Name: Rafsan Jani. Engineering Aspirant, CS student from Dinajpur, Bangladesh.
Education: HSC GPA 5.00/5.00 — Rajshahi Cadet College. 17th on National Merit List (top 0.01% of 180,000+ students). SSC GPA 5.00 — also 18th nationally.
Currently seeking: BSc in Computer Science and Engineering (interested in Türkiye).
Leadership: College Prefect — managed 297 cadets. Best All-Round Cadet. Best Disciplined Cadet. ISSB Green Card (Army Officer recommended).
Skills: Python, C/C++, HTML, CSS, GitHub, Arduino, Raspberry Pi, ESP32, Adobe Illustrator, Photoshop.
Languages: Bengali (Native), English (C1), Arabic (introductory).

KEY PROJECTS:
AgriBase: Precision agriculture app. Bronze Medal, Innovation World Cup Bangladesh. Flask + Bayesian Regression, converted 50,000+ records.
CERN Beamline for Schools: Particle physics experiment using SiPMs and BC-408 scintillators to verify relativistic time dilation.
HAYTHAM X ONE: Energy nexus combining CSP solar power with AI management and hydrogen production.
DCMD Water Purification: Arsenic/salinity solution providing 5L safe water/person/day.

AWARDS: IYMC Silver Honor (2024), BdJSO National Winner (2020), IAAC Qualifier (2022), TIB Anti-Corruption 1st Place (2022).

CONTACT: rafsan2972jani@gmail.com | GitHub: rafsan-j | LinkedIn: linkedin.com/in/rafsan-jani72
Location: Dinajpur, Bangladesh.

If asked something outside this profile say: "That is outside what I can speak to — reach Rafsan directly at rafsan2972jani@gmail.com"`;

    try {
      const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (sbUrl && sbKey) {
        const r = await fetch(
          `${sbUrl}/rest/v1/pf_ai_knowledge?id=eq.1&select=system_prompt_text`,
          { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
        );
        if (r.ok) {
          const d = await r.json();
          if (d?.[0]?.system_prompt_text) systemPrompt = d[0].system_prompt_text;
        }
      }
    } catch { /* use fallback */ }

    // ── Build request body ────────────────────────────────────────────────
    const geminiHistory = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const lastMsg = messages[messages.length - 1]?.content ?? '';

    const geminiBody = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [...geminiHistory, { role: 'user', parts: [{ text: lastMsg }] }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.7, topP: 0.9 },
    };

    // ── Try each model in order ───────────────────────────────────────────
    let geminiRes: Response | null = null;
    for (const model of MODELS) {
      geminiRes = await tryGemini(apiKey, model, geminiBody);
      if (geminiRes !== null) break;
    }

    if (!geminiRes) {
      return new Response('No working Gemini model found. Check your API key at aistudio.google.com', { status: 502 });
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error(`Gemini error ${geminiRes.status}:`, errText);
      // Return a friendly message to the user
      return new Response(
        `Gemini API error ${geminiRes.status}. Common causes: invalid API key, quota exceeded, or billing not enabled. Check aistudio.google.com`,
        { status: 502 }
      );
    }

    // ── Stream response ───────────────────────────────────────────────────
    const stream = new ReadableStream({
      async start(controller) {
        const reader  = geminiRes!.body!.getReader();
        const decoder = new TextDecoder();
        let buffer    = '';
        try {
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
              } catch { /* skip malformed chunk */ }
            }
          }
        } finally { controller.close(); }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });

  } catch (err) {
    console.error('AI route error:', err);
    return new Response('Server error', { status: 500 });
  }
}
