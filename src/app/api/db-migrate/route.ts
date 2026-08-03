import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (token !== 'apm-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectRef = 'uktgbtzlkgxrhrzcvnal'
  const results: string[] = []
  const passwords = ['Arthur@472003', 'postgres']
  
  // Try both direct and pooler connections
  const hosts = [
    { type: 'direct', host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' },
    { type: 'pooler-us-east-1', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-us-west-1', host: 'aws-0-us-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-eu-west-1', host: 'aws-0-eu-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-eu-central-1', host: 'aws-0-eu-central-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-ap-southeast-1', host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-ap-northeast-1', host: 'aws-0-ap-northeast-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  ]

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
        results.push(`✅ Connected via ${h.type} with password`)
        connected = true
        
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
        
        await client.query(ddl)
        results.push('✅ article_analytics table created')
        
        const check = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'article_analytics'")
        results.push(`Verification: ${check.rows[0].count} table(s) found`)
        
        client.release()
        await pool.end()
      } catch (e: any) {
        // Only log unique failures
        const msg = e.message.substring(0, 100)
        if (!results.some(r => r.includes(msg))) {
          results.push(`❌ ${h.type}/${pwd.substring(0,8)}: ${msg}`)
        }
      }
    }
  }
  
  if (!connected) {
    results.push('Could not connect to database with any host/password combination')
  }
  
  return NextResponse.json({ results })
}
