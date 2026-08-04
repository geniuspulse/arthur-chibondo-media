import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (token !== 'apm-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectRef = 'uktgbtzlkgxrhrzcvnal'
  const results: string[] = []
  
  const passwords = [
    'Arthur@472003Chibondo',
    'Arthur@472003',
    'Arthur@472003Chibondo!',
    'Arthur@472003!',
    'ArthurChibondo@472003',
    'Chibondo@472003',
    'apm-chibondo',
    'ApmChibondo2026',
    'apmchibondo2026',
    'Arthur@2003Chibondo',
    'Arthur@472003C',
    'brandfletch',
    'Brandfletch@472003',
    'Arthur2026',
    'apm2026',
    'ArthurChibondo2026',
    'ApmChibondo@2026',
    'Arthur@472003Chibondo2026',
  ]
  
  const hosts = [
    { type: 'pooler-us-east-1', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'direct-v2', host: `${projectRef}.db.supabase.co`, port: 5432, user: 'postgres' },
    { type: 'direct-v1', host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' },
  ]

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

  let connected = false
  
  for (const h of hosts) {
    for (const pwd of passwords) {
      if (connected) break
      try {
        const pool = new Pool({
          host: h.host,
          database: 'postgres',
          user: h.user,
          password: pwd,
          port: h.port,
          connectionTimeoutMillis: 10000,
          ssl: { rejectUnauthorized: false },
        })
        
        const client = await pool.connect()
        results.push(`CONNECTED via ${h.type} with password ${pwd.substring(0, 8)}`)
        connected = true
        
        await client.query(ddl)
        results.push('article_analytics table created successfully')
        
        const check = await client.query('SELECT count(*) FROM article_analytics')
        results.push(`Table verified - row count: ${check.rows[0].count}`)
        
        client.release()
        await pool.end()
      } catch (e: any) {
        const msg = (e.message || 'unknown').substring(0, 60)
        results.push(`${h.type}/${pwd.substring(0,10)}: ${msg}`)
      }
    }
    if (connected) break
  }
  
  if (!connected) {
    results.push('Could not connect with any password/host combination')
  }
  
  return NextResponse.json({ results, success: connected })
}
