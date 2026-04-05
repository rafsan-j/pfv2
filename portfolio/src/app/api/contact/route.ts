import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { name, email, message, honeypot } = await req.json();

    // Bot trap
    if (honeypot) return new Response('OK', { status: 200 });
    if (!name || !email || !message) return new Response('Missing fields', { status: 400 });

    const { error } = await supabase.from('pf_inbox_messages').insert({
      sender_name: name, sender_email: email, message,
    });
    if (error) throw error;

    // Optional auto-reply via Resend
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    'Rafsan Jani <noreply@rafsanjani.dev>',
          to:      [email],
          subject: 'Got your message!',
          html:    `<p>Hi ${name},</p><p>Thanks for reaching out — Rafsan received your message and will reply soon.</p><p>— RJ Portfolio</p>`,
        }),
      }).catch(() => {}); // non-critical
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Contact error:', err);
    return new Response('Error', { status: 500 });
  }
}
