import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (token !== 'apm-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const results: string[] = []

  // ── Check each table independently ──
  
  // 1. article_comments
  const { error: commentsErr } = await supabaseAdmin
    .from('article_comments')
    .select('id')
    .limit(1)
  
  if (commentsErr && commentsErr.code === '42P01') {
    results.push('article_comments: ❌ MISSING — needs creation')
  } else if (commentsErr) {
    results.push(`article_comments: ⚠️ ${commentsErr.message}`)
  } else {
    results.push('article_comments: ✅ EXISTS')
  }

  // 2. article_analytics
  const { error: analyticsErr } = await supabaseAdmin
    .from('article_analytics')
    .select('id')
    .limit(1)

  if (analyticsErr && analyticsErr.code === '42P01') {
    results.push('article_analytics: ❌ MISSING — needs creation')
  } else if (analyticsErr) {
    results.push(`article_analytics: ⚠️ ${analyticsErr.message}`)
  } else {
    results.push('article_analytics: ✅ EXISTS')
  }

  // ── Create missing tables via the Supabase Management API ──
  const projectRef = url.match(/\/\/(.+?)\.supabase/)?.[1]
  const needsCreation = (analyticsErr?.code === '42P01') || (commentsErr?.code === '42P01')

  if (needsCreation) {
    const ddlStatements: string[] = []

    if (commentsErr?.code === '42P01') {
      ddlStatements.push(`
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
      `)
    }

    if (analyticsErr?.code === '42P01') {
      ddlStatements.push(`
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
      `)
    }

    try {
      const pgRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ddlStatements.join('\n') })
      })
      
      if (pgRes.ok) {
        results.push('DDL: ✅ Tables created successfully')
      } else {
        const pgResult = await pgRes.text()
        results.push(`DDL: ⚠️ Management API returned ${pgRes.status}: ${pgResult.substring(0, 200)}`)
      }
    } catch (e: any) {
      results.push(`DDL: ❌ ${e.message}`)
    }
  }

  return NextResponse.json({ results })
}
