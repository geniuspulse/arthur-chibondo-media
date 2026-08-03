import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (token !== 'apm-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectRef = 'uktgbtzlkgxrhrzcvnal'
  const results: string[] = []
  
  const passwords = ['Arthur@472003', 'postgres']
  let pool: Pool | null = null
  
  for (const pwd of passwords) {
    try {
      pool = new Pool({
        host: `db.${projectRef}.supabase.co`,
        database: 'postgres',
        user: 'postgres',
        password: pwd,
        port: 5432,
        connectionTimeoutMillis: 15000,
        ssl: { rejectUnauthorized: false },
      })
      
      const client = await pool.connect()
      results.push(`Connected with password variant`)
      
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
      results.push('article_analytics table created successfully')
      
      const check = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'article_analytics'")
      results.push(`Verification: ${check.rows[0].count} table(s) found`)
      
      client.release()
      break
    } catch (e: any) {
      results.push(`Password attempt failed: ${e.message.substring(0, 120)}`)
      if (pool) { await pool.end(); pool = null }
    }
  }
  
  if (pool) await pool.end()
  
  return NextResponse.json({ results })
}
