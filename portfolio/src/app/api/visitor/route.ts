export const runtime = 'edge';

const sbUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const sbKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const headers = () => ({
  'Content-Type':  'application/json',
  'apikey':        sbKey(),
  'Authorization': `Bearer ${sbKey()}`,
});

export async function GET() {
  const res = await fetch(
    `${sbUrl()}/rest/v1/pf_visitor_counter?id=eq.1&select=count`,
    { headers: headers() }
  );
  const data = await res.json();
  return Response.json({ count: data?.[0]?.count ?? 0 });
}

export async function POST() {
  // Call the SQL function we defined in migration.sql
  const res = await fetch(
    `${sbUrl()}/rest/v1/rpc/increment_visitor_count`,
    {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify({}),
    }
  );

  if (res.ok) {
    // RPC returns the new count directly
    const count = await res.json();
    return Response.json({ count: count ?? 0 });
  }

  // Fallback: manual increment via PATCH
  const getRes = await fetch(
    `${sbUrl()}/rest/v1/pf_visitor_counter?id=eq.1&select=count`,
    { headers: headers() }
  );
  const current = await getRes.json();
  const newCount = (current?.[0]?.count ?? 0) + 1;

  await fetch(`${sbUrl()}/rest/v1/pf_visitor_counter?id=eq.1`, {
    method:  'PATCH',
    headers: { ...headers(), 'Prefer': 'return=minimal' },
    body:    JSON.stringify({ count: newCount }),
  });

  return Response.json({ count: newCount });
}
