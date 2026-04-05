import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET() {
  const { data } = await supabase.from('pf_visitor_counter').select('count').eq('id', 1).single();
  return Response.json({ count: data?.count ?? 0 });
}

export async function POST() {
  // Atomic increment
  const { data } = await supabase
    .from('pf_visitor_counter')
    .update({ count: supabase.rpc('increment_visitor_count' as never) })
    .eq('id', 1)
    .select('count')
    .single();
  return Response.json({ count: data?.count ?? 0 });
}
