-- Arthur Chibondo Media — Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database

-- ARTICLES
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  cover_image text,
  category text check (category in ('Entrepreneurship','Technology & AI','Education','Business','Malawi Development','Personal Growth','Politics & Society','Media')),
  tags text[],
  author text default 'Arthur Chibondo',
  reading_time int default 5,
  status text default 'draft' check (status in ('draft','published','archived')),
  is_featured boolean default false,
  views int default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROJECTS
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  tagline text,
  description text,
  cover_image text,
  logo_image text,
  problem text,
  solution text,
  tech_stack text,
  status text default 'active' check (status in ('active','in_development','completed','coming_soon')),
  website_url text,
  is_featured boolean default false,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MEDIA APPEARANCES
create table if not exists media_appearances (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('interview','podcast','video','article','press')),
  source text,
  url text,
  thumbnail text,
  description text,
  appeared_at date,
  created_at timestamptz default now()
);

-- NEWSLETTER SUBSCRIBERS
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  status text default 'active' check (status in ('active','unsubscribed')),
  subscribed_at timestamptz default now()
);

-- CONTACT MESSAGES
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  inquiry_type text check (inquiry_type in ('general','business','media','speaking','collaboration')),
  subject text,
  message text not null,
  status text default 'new' check (status in ('new','read','replied')),
  created_at timestamptz default now()
);

-- ENABLE RLS
alter table articles enable row level security;
alter table projects enable row level security;
alter table media_appearances enable row level security;
alter table newsletter_subscribers enable row level security;
alter table contact_messages enable row level security;

-- PUBLIC READ POLICIES
create policy "Public can read published articles" on articles for select using (status = 'published');
create policy "Public can read projects" on projects for select using (true);
create policy "Public can read media appearances" on media_appearances for select using (true);

-- PUBLIC WRITE POLICIES (subscribe, contact)
create policy "Anyone can subscribe" on newsletter_subscribers for insert with check (true);
create policy "Anyone can send contact message" on contact_messages for insert with check (true);

-- SEED DATA — Projects
insert into projects (name, slug, tagline, description, problem, solution, tech_stack, status, website_url, is_featured, display_order) values
(
  'The Chibondo Academy',
  'chibondo-academy',
  'Online learning for Malawian students',
  'An online learning platform helping Malawian students prepare for MSCE examinations with quality study materials, practice tests, and expert guidance.',
  'Malawian students lack access to quality revision materials and personalised learning support.',
  'A digital platform delivering structured MSCE prep content, video lessons, and practice exams accessible on any device.',
  'Next.js, Node.js, PostgreSQL, AWS',
  'active',
  'https://chibondoacademy.com',
  true,
  1
),
(
  'Brandfletch Media',
  'brandfletch-media',
  'Digital marketing for African businesses',
  'A digital marketing and advertising company helping businesses across Malawi and Africa grow their online presence, reach customers, and drive revenue.',
  'African SMEs struggle to navigate digital marketing effectively and affordably.',
  'Full-service digital marketing: social media, SEO, paid ads, content, and brand strategy tailored for African markets.',
  'Various marketing platforms, proprietary tools',
  'active',
  'https://brandfletch.com',
  true,
  2
),
(
  'NyasaDesk',
  'nyasadesk',
  'AI-powered customer communication platform',
  'A customer communication and AI automation platform built for African businesses — handling support, live chat, WhatsApp integration, and intelligent automation.',
  'African businesses lack affordable, locally-relevant customer communication tools.',
  'An all-in-one inbox with AI automation, WhatsApp and SMS integration, and intelligent routing designed for Africa.',
  'React, Node.js, OpenAI, Twilio, PostgreSQL, Supabase',
  'in_development',
  'https://nyasadesk.com',
  true,
  3
);

-- SEED DATA — Articles
insert into articles (title, slug, excerpt, content, category, reading_time, status, is_featured, published_at) values
(
  'Why I''m Building in Malawi',
  'why-im-building-in-malawi',
  'Many ask why I stay and build here. Here is my answer.',
  'When people learn I am building technology companies from Malawi, the first question is almost always: "Why not go abroad?"

It is a fair question. The infrastructure challenges are real. The funding ecosystem is nascent. The talent pool is still developing. Every founder here will tell you the same story — the power cuts, the connectivity frustrations, the limited access to capital.

But here is what those questions miss: the opportunity.

Malawi has 20 million people. The majority are young. Mobile penetration is growing fast. And the problems that need solving — in education, healthcare, finance, agriculture — are enormous. The kind of problems that, when solved, do not just build a business. They change a country.

I stay because I believe the best founders in Malawi''s history have not been born yet. I stay because every solution we build here is proof that it can be done. I stay because building from Africa, for Africa, is not a limitation — it is a superpower.

The world is full of startups solving first-world problems with marginal improvements. Here, we are solving fundamental ones.

That is why I build in Malawi.',
  'Entrepreneurship',
  5,
  'published',
  true,
  now() - interval '8 days'
),
(
  'The Future of Education Technology in Africa',
  'future-of-education-technology-in-africa',
  'AI and mobile are about to transform how African students learn.',
  'Africa has the youngest population on Earth. By 2050, one in four people on the planet will be African. And right now, tens of millions of those young people are being failed by education systems that were built for a different era.

The good news: technology is about to change everything.

Mobile internet penetration across Sub-Saharan Africa has crossed a tipping point. Smartphones are no longer a luxury — they are the primary computing device for most young Africans. This creates an extraordinary distribution channel for educational content that simply did not exist a decade ago.

AI is the second revolution. Adaptive learning systems can now provide something that no underfunded public school can: personalised instruction at scale. A student in rural Malawi with a smartphone and an internet connection can now access a learning experience that adapts to their pace, identifies their weak points, and guides them to mastery.

At Chibondo Academy, we are building exactly this — starting with MSCE preparation for Malawian students, because getting that qualification right changes the trajectory of a young person''s life.

The next decade will produce Africa''s greatest education technology companies. I intend for some of them to come from Malawi.',
  'Education',
  7,
  'published',
  false,
  now() - interval '17 days'
);

-- Update timestamp function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_updated_at before update on articles for each row execute function update_updated_at();
create trigger projects_updated_at before update on projects for each row execute function update_updated_at();
