import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Project = {
  id: string; title: string; description: string;
  tech_stack: string[]; github_url?: string; live_url?: string;
  cover_image_url?: string; case_study?: string;
  is_featured?: boolean; sort_order?: number; created_at: string;
};
export type ArchiveEntry = {
  id: string; title: string; abstract_content: string;
  tags?: string[]; pdf_url?: string; date_completed: string;
};
export type InkwellPost = {
  id: string; title: string; slug: string; content: string;
  cover_image_url?: string; excerpt?: string; reading_time?: number;
  is_published: boolean; created_at: string;
};
export type GalleryImage = {
  id: string; image_url: string; caption?: string;
  category?: string; uploaded_at: string;
};
export type MapLocation = {
  id: string; location_name: string;
  latitude: number; longitude: number;
  visited_date?: string; story?: string;
  photo_url?: string; is_wishlist?: boolean;
};
export type InboxMessage = {
  id: string; sender_name: string; sender_email: string;
  message: string; is_read: boolean; created_at: string;
};
