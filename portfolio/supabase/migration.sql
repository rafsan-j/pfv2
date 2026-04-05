-- ============================================================
-- RAFSAN JANI PORTFOLIO — Supabase SQL Migration
-- Paste this entire file into: Supabase → SQL Editor → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- Lab Projects
create table if not exists pf_projects_lab (
  id              uuid default uuid_generate_v4() primary key,
  title           text not null,
  description     text,
  tech_stack      text[] default '{}',
  github_url      text,
  live_url        text,
  cover_image_url text,
  case_study      text,
  is_featured     boolean default false,
  sort_order      int default 0,
  created_at      timestamptz default now()
);

-- Archive / Academic
create table if not exists pf_projects_archive (
  id               uuid default uuid_generate_v4() primary key,
  title            text not null,
  abstract_content text,
  tags             text[] default '{}',
  pdf_url          text,
  date_completed   date,
  created_at       timestamptz default now()
);

-- Inkwell Posts
create table if not exists pf_inkwell_posts (
  id              uuid default uuid_generate_v4() primary key,
  title           text not null,
  slug            text unique not null,
  content         text,
  cover_image_url text,
  excerpt         text,
  reading_time    int,
  is_published    boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Gallery Images
create table if not exists pf_gallery_images (
  id          uuid default uuid_generate_v4() primary key,
  image_url   text not null,
  caption     text,
  category    text default 'general',
  uploaded_at timestamptz default now()
);

-- BD Map Locations
create table if not exists pf_map_locations (
  id            uuid default uuid_generate_v4() primary key,
  location_name text not null,
  latitude      numeric(10,7) not null,
  longitude     numeric(10,7) not null,
  visited_date  date,
  story         text,
  photo_url     text,
  is_wishlist   boolean default false,
  created_at    timestamptz default now()
);

-- Contact Inbox
create table if not exists pf_inbox_messages (
  id           uuid default uuid_generate_v4() primary key,
  sender_name  text not null,
  sender_email text not null,
  message      text not null,
  is_read      boolean default false,
  created_at   timestamptz default now()
);

-- AI Knowledge Base (single-row)
create table if not exists pf_ai_knowledge (
  id                 int primary key default 1,
  system_prompt_text text,
  last_updated       timestamptz default now(),
  constraint single_row check (id = 1)
);

-- Visitor Counter (single-row)
create table if not exists pf_visitor_counter (
  id    int primary key default 1,
  count bigint default 0,
  constraint single_row check (id = 1)
);
insert into pf_visitor_counter (id, count) values (1, 0) on conflict (id) do nothing;

-- RLS
alter table pf_projects_lab      enable row level security;
alter table pf_projects_archive  enable row level security;
alter table pf_inkwell_posts     enable row level security;
alter table pf_gallery_images    enable row level security;
alter table pf_map_locations     enable row level security;
alter table pf_inbox_messages    enable row level security;
alter table pf_ai_knowledge      enable row level security;
alter table pf_visitor_counter   enable row level security;

create policy "public read lab"     on pf_projects_lab     for select using (true);
create policy "public read archive" on pf_projects_archive for select using (true);
create policy "public read posts"   on pf_inkwell_posts    for select using (is_published = true);
create policy "public read gallery" on pf_gallery_images   for select using (true);
create policy "public read map"     on pf_map_locations    for select using (true);
create policy "public read counter" on pf_visitor_counter  for select using (true);
create policy "public read ai"      on pf_ai_knowledge     for select using (true);
create policy "public insert msg"   on pf_inbox_messages   for insert with check (true);
create policy "public update count" on pf_visitor_counter  for update using (true) with check (true);

-- Allow admin (service role) full access on inbox and knowledge
create policy "admin all inbox"     on pf_inbox_messages for all using (true) with check (true);
create policy "admin all knowledge" on pf_ai_knowledge   for all using (true) with check (true);

-- Seed: AI Knowledge Base
insert into pf_ai_knowledge (id, system_prompt_text) values (1,
'You are an AI assistant representing Rafsan Jani. Answer questions strictly based on this profile. Be confident and first-person when appropriate.

PROFILE:
Name: Rafsan Jani
Education: HSC GPA 5.00/5.00 — Rajshahi Cadet College. 17th on National Merit List (top 0.01%). SSC GPA 5.00/5.00, 18th nationally.
Currently seeking: BSc in Computer Science and Engineering (interested in Türkiye).
Leadership: College Prefect — managed 297 cadets. Best All-Round Cadet. Best Disciplined Cadet. ISSB Green Card (Army Officer recommended).
Skills: Python, C/C++, HTML, CSS, GitHub, Arduino, Raspberry Pi, ESP32, Adobe Illustrator, Photoshop.
Languages: Bengali (Native), English (C1), Arabic (introductory).

KEY PROJECTS:
- AgriBase: Precision agriculture app. Bronze Medal, Innovation World Cup Bangladesh. Flask + Bayesian Regression, converted 50,000+ records.
- CERN Beamline for Schools: Particle physics experiment using SiPMs and BC-408 scintillators to verify relativistic time dilation.
- HAYTHAM X ONE: Energy nexus combining CSP solar power with AI management and hydrogen production.
- DCMD Water Purification: Arsenic/salinity solution providing 5L safe water/person/day.
- Eco-Alchemy: Waste-to-energy via halogen-free plastic incineration.

AWARDS: IYMC Silver Honor (2024), BdJSO National Winner (2020), IAAC Qualifier (2022), TIB Anti-Corruption 1st Place (2022), 4th Champion Mathematical Olympiad (2018).

CONTACT: rafsan2972jani@gmail.com | +8801776132121 | Dinajpur, Bangladesh
GitHub: rafsan-j | LinkedIn: ralsan-jani72

If asked something outside this profile, say: "That is not something I can speak to — reach out directly at rafsan2972jani@gmail.com"'
) on conflict (id) do update set system_prompt_text = excluded.system_prompt_text;

-- Seed: Map Locations
insert into pf_map_locations (location_name, latitude, longitude, story, is_wishlist) values
  ('Dinajpur',    25.6279, 88.6326, 'Home. Where it all started. The place that grounds me.', false),
  ('Rajshahi',    24.3745, 88.6042, 'Rajshahi Cadet College — 5 years that forged everything. Leadership, discipline, friendship.', false),
  ('Dhaka',       23.8103, 90.4125, 'The capital. Science olympiads, competitions, and big dreams.', false),
  ('Rangpur',     25.7439, 89.2752, 'Division headquarters — close to home, rich in history.', false),
  ('Cox''s Bazar', 21.4272, 92.0058, 'The world''s longest sea beach. On the wishlist — must see before I leave Bangladesh.', true),
  ('Sylhet',      24.8949, 91.8687, 'Tea gardens and waterfalls. A place I want to explore.', true),
  ('Chittagong',  22.3569, 91.7832, 'Port city and commercial hub. Want to visit the hill tracts nearby.', true)
on conflict do nothing;

-- Seed: Lab Projects
insert into pf_projects_lab (title, description, tech_stack, is_featured, sort_order, github_url) values
  ('AgriBase — Precision Agriculture Ecosystem',
   'Converted 50,000+ unstructured agricultural records into a predictive database using Flask and Bayesian Regression to address crop waste and improve yields. Earned Bronze Medal at Innovation World Cup Bangladesh.',
   ARRAY['Python', 'Flask', 'Bayesian Regression', 'PostgreSQL', 'Data Analysis'],
   true, 1, 'https://github.com/rafsan-j'),

  ('HAYTHAM X ONE — Reliable Energy Nexus',
   'A framework integrating Concentrating Solar Power (CSP) with AI-driven management systems and hydrogen production for sustainable energy generation. Addresses Bangladesh''s power generation crisis.',
   ARRAY['Python', 'AI/ML', 'IoT', 'ESP32', 'Solar Engineering'],
   true, 2, null),

  ('DCMD & PTR — Integrated Water Purification',
   'Sustainable solution for arsenic and salinity crises in Bangladesh. Pairs modified Direct Contact Membrane Distillation with solar reflectors to provide 5 liters of safe water per person daily.',
   ARRAY['Engineering', 'Arduino', 'Sensor Integration', 'Environmental Tech'],
   false, 3, null),

  ('CERN Beamline for Schools — Muon Experiment',
   'Designed a particle physics experiment using SiPMs and BC-408 scintillators to verify relativistic time dilation at the T9 beamline at CERN. Submitted as part of the international Beamline for Schools competition.',
   ARRAY['Particle Physics', 'SiPM Sensors', 'Data Analysis', 'Python'],
   true, 4, null),

  ('Eco-Alchemy — Waste to Energy',
   'Innovative incineration process for halogen-free plastics to convert waste into usable energy safely, addressing Bangladesh''s plastic waste problem.',
   ARRAY['Environmental Engineering', 'Chemical Process', 'Sustainability'],
   false, 5, null)
on conflict do nothing;

-- Seed: Archive entries
insert into pf_projects_archive (title, abstract_content, tags, date_completed) values
  ('Harnessing the Sun — Advanced Heliostat Implementation',
   'A proposal for advanced heliostat field implementation to address the current power generation crisis in Bangladesh. Analyses concentrating solar power viability at national scale with cost-benefit projections.',
   ARRAY['Solar Energy', 'Engineering', 'Bangladesh', 'Sustainability'],
   '2024-06-01'),
  ('Dissecting Muons — CERN Beamline for Schools',
   'Full experimental design document for a particle physics experiment submitted to CERN''s Beamline for Schools competition. Uses scintillation detectors to measure muon flux and verify time dilation predictions.',
   ARRAY['Particle Physics', 'CERN', 'Experimental Design', 'Relativity'],
   '2024-03-15'),
  ('British Council COP26 Climate Simulation',
   'Participated as a representative in the British Council''s COP26 climate conference simulation, negotiating environmental policy positions and sustainable development commitments.',
   ARRAY['Climate Policy', 'Leadership', 'International Relations'],
   '2021-11-01')
on conflict do nothing;

-- ── Visitor counter increment function ────────────────────────────────────────
-- Run this so the /api/visitor route works
create or replace function increment_visitor_count()
returns bigint
language sql
as $$
  update pf_visitor_counter set count = count + 1 where id = 1 returning count;
$$;
