import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}))
  if (token !== 'apm-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!password) return NextResponse.json({ error: 'password required' }, { status: 400 })

  const projectRef = 'uktgbtzlkgxrhrzcvnal'
  const results: string[] = []
  
  const ddl = `
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
  `

  // Try multiple connection formats
  const hosts = [
    { type: 'pooler-us-east-1', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-session', host: 'aws-0-us-east-1.pooler.supabase.com', port: 5432, user: `postgres.${projectRef}` },
    { type: 'direct', host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' },
    { type: 'direct-ipv6', host: `${projectRef}.db.supabase.co`, port: 5432, user: 'postgres' },
  ]

  let connected = false
  
  for (const h of hosts) {
    if (connected) break
    try {
      const pool = new Pool({
        host: h.host,
        database: 'postgres',
        user: h.user,
        password: password,
        port: h.port,
        connectionTimeoutMillis: 15000,
        ssl: { rejectUnauthorized: false },
      })
      
      const client = await pool.connect()
      results.push(`CONNECTED via ${h.type}`)
      connected = true
      
      await client.query(ddl)
      results.push('article_analytics table created')
      
      const check = await client.query('SELECT count(*) FROM article_analytics')
      results.push(`verified - rows: ${check.rows[0].count}`)
      
      // Also add published_at column to articles if missing
      try {
        await client.query('ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ')
        results.push('added published_at column to articles')
      } catch (e: any) {
        results.push(`articles column: ${e.message?.substring(0, 60)}`)
      }
      
      client.release()
      await pool.end()
    } catch (e: any) {
      results.push(`${h.type}: ${e.message?.substring(0, 80)}`)
    }
  }
  
  return NextResponse.json({ results, success: connected })
}
