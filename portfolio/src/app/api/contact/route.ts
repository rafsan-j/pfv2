export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { name, email, message, honeypot } = await req.json();

    // Bot trap — silent success
    if (honeypot) return new Response('OK', { status: 200 });
    if (!name || !email || !message) {
      return new Response('Missing fields', { status: 400 });
    }

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!sbUrl || !sbKey) {
      return new Response('DB not configured', { status: 503 });
    }

    // Insert via Supabase REST — no Node.js SDK needed on edge
    const insertRes = await fetch(`${sbUrl}/rest/v1/pf_inbox_messages`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        sbKey,
        'Authorization': `Bearer ${sbKey}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({
        sender_name:  name,
        sender_email: email,
        message,
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error('Supabase insert error:', errText);
      return new Response('DB error', { status: 500 });
    }

    // Optional auto-reply via Resend (non-critical — never fail the request)
    if (process.env.RESEND_API_KEY) {
      fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    'Rafsan Jani <noreply@rafsanjani.dev>',
          to:      [email],
          subject: 'Got your message!',
          html: `<p>Hi ${name},</p>
                 <p>Thanks for reaching out — Rafsan received your message and will reply soon.</p>
                 <p>— RJ Portfolio</p>`,
        }),
      }).catch(() => {});
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Contact route error:', err);
    return new Response('Server error', { status: 500 });
  }
}
