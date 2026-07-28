import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (token !== 'apm-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Check if table exists
  const { error: checkErr } = await admin.from('article_comments').select('id').limit(1)
  
  if (!checkErr || checkErr.code !== '42P01') {
    return NextResponse.json({ message: checkErr ? `Table check: ${checkErr.message}` : '✅ article_comments already exists' })
  }

  // Table doesn't exist - Supabase JS can't run DDL directly
  // Return instructions for manual creation
  return NextResponse.json({ 
    message: 'Table does not exist. Please run the SQL below in your Supabase SQL Editor:',
    sql: `
CREATE TABLE article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert" ON article_comments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_read_approved" ON article_comments FOR SELECT TO anon USING (is_approved = true);
CREATE POLICY "admin_all" ON article_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
    `.trim()
  })
}
