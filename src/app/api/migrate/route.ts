import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (token !== 'apm-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  // Decode the v2 service role key to get the actual JWT
  // v2 format: base64url-encoded JSON with the actual key inside
  let actualKey = serviceKey
  try {
    if (serviceKey.startsWith('eyJ2Ijoid')) {
      const decoded = JSON.parse(Buffer.from(serviceKey.split('.')[1], 'base64url').toString())
      // If it's wrapped, we need the c field
      const wrapped = JSON.parse(Buffer.from(serviceKey, 'base64').toString().split('\n').slice(1,-1).join(''))
      actualKey = wrapped.key || serviceKey
    }
  } catch {}

  // Execute DDL via the Supabase pg SQL endpoint using our token
  const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } })
  
  // Check if table exists
  const { count, error: checkErr } = await supabaseAdmin
    .from('article_comments')
    .select('*', { count: 'exact', head: true })
  
  if (!checkErr) {
    return NextResponse.json({ message: '✅ article_comments table already exists', count })
  }
  
  if (checkErr.code !== '42P01') {
    return NextResponse.json({ error: checkErr.message, code: checkErr.code })
  }

  // Table doesn't exist - need to create via raw HTTP to pg
  // Use the Supabase management API via our token
  const pgRes = await fetch(`${url.replace('.supabase.co', '')}.supabase.com/v1/projects/${url.match(/\/\/(.+?)\.supabase/)?.[1]}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `
      CREATE TABLE IF NOT EXISTS article_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        article_slug TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_email TEXT,
        content TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "public_insert" ON article_comments;
      DROP POLICY IF EXISTS "public_read_approved" ON article_comments;
      DROP POLICY IF EXISTS "admin_all" ON article_comments;
      CREATE POLICY "public_insert" ON article_comments FOR INSERT TO anon WITH CHECK (true);
      CREATE POLICY "public_read_approved" ON article_comments FOR SELECT TO anon USING (is_approved = true);
      CREATE POLICY "admin_all" ON article_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);

      -- Analytics table
      CREATE TABLE IF NOT EXISTS article_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id UUID,
        visitor_hash VARCHAR(32),
        referrer TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      ALTER TABLE article_analytics ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "analytics_service_role" ON article_analytics;
      CREATE POLICY "analytics_service_role" ON article_analytics FOR ALL USING (true);
      CREATE INDEX IF NOT EXISTS idx_analytics_article_id ON article_analytics(article_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON article_analytics(created_at);
    ` })
  })
  
  const pgResult = await pgRes.json()
  return NextResponse.json({ status: pgRes.status, result: pgResult })
}
