import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (token !== 'apm-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectRef = 'uktgbtzlkgxrhrzcvnal'
  const results: string[] = []
  const password = 'Arthur@472003Chibondo'
  
  // Use the pooler connection (us-east-1 region confirmed working)
  const hosts = [
    { type: 'pooler-us-east-1', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-eu-west-1', host: 'aws-0-eu-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  ]

  let connected = false
  
  for (const h of hosts) {
    if (connected) break
    try {
      const pool = new Pool({
        host: h.host, database: 'postgres', user: h.user, password,
        port: h.port, connectionTimeoutMillis: 10000, ssl: { rejectUnauthorized: false },
      })
      
      const client = await pool.connect()
      results.push(`Connected via ${h.type}`)
      connected = true
      
      const ddl = `
        -- Analytics table for per-article visitor tracking
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

        -- ACM Followers table — followers of Arthur Chibondo
        CREATE TABLE IF NOT EXISTS acm_followers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE,
          email TEXT,
          display_name TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );
        ALTER TABLE acm_followers ENABLE ROW LEVEL SECURITY;
        
        -- Allow users to insert their own follow record
        DROP POLICY IF EXISTS "followers_self_insert" ON acm_followers;
        CREATE POLICY "followers_self_insert" ON acm_followers FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        -- Allow users to delete their own follow record (unsubscribe)
        DROP POLICY IF EXISTS "followers_self_delete" ON acm_followers;
        CREATE POLICY "followers_self_delete" ON acm_followers FOR DELETE USING (auth.uid() = user_id);
        
        -- Public read — so we can show follower count
        DROP POLICY IF EXISTS "followers_public_read" ON acm_followers;
        CREATE POLICY "followers_public_read" ON acm_followers FOR SELECT USING (true);
        
        -- Service role can do everything
        DROP POLICY IF EXISTS "followers_service_role" ON acm_followers;
        CREATE POLICY "followers_service_role" ON acm_followers FOR ALL USING (true);
        
        CREATE INDEX IF NOT EXISTS idx_followers_user_id ON acm_followers(user_id);
        CREATE INDEX IF NOT EXISTS idx_followers_created_at ON acm_followers(created_at);

        -- Add views column to articles if not exists
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
      `
      
      await client.query(ddl)
      results.push('DDL executed successfully')
      
      // Verify tables
      const tables = ['article_analytics', 'acm_followers']
      for (const t of tables) {
        const check = await client.query(`SELECT count(*) FROM information_schema.tables WHERE table_name = '${t}'`)
        results.push(`${t}: ${check.rows[0].count > 0 ? 'EXISTS' : 'MISSING'}`)
      }
      
      // Count followers
      const fc = await client.query('SELECT count(*) FROM acm_followers')
      results.push(`Followers count: ${fc.rows[0].count}`)
      
      client.release()
      await pool.end()
    } catch (e: any) {
      results.push(`${h.type} failed: ${e.message.substring(0, 120)}`)
    }
  }
  
  if (!connected) {
    results.push('Could not connect to database')
  }
  
  return NextResponse.json({ results })
}
