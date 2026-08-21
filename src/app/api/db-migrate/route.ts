import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (token !== 'apm-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectRef = 'gbxescpzeogckclpsewb'
  const results: string[] = []
  const passwords = ['Arthur@472003Chibondo', 'Arthur@472003']
  
  const hosts = [
    { type: 'pooler-us-east-1', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-us-west-1', host: 'aws-0-us-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-eu-west-1', host: 'aws-0-eu-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-ap-southeast-1', host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-ap-northeast-1', host: 'aws-0-ap-northeast-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'direct', host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' },
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
          connectionTimeoutMillis: 15000,
          ssl: { rejectUnauthorized: false },
        })
        
        const client = await pool.connect()
        results.push(`Connected via ${h.type} with password ${pwd.substring(0, 8)}...`)
        connected = true
        
        const ddl = `
          CREATE TABLE IF NOT EXISTS acm_followers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL UNIQUE,
            email TEXT,
            display_name TEXT,
            notifications_enabled BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT now()
          );
          ALTER TABLE acm_followers ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "followers_self_insert" ON acm_followers;
          CREATE POLICY "followers_self_insert" ON acm_followers FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          DROP POLICY IF EXISTS "followers_self_delete" ON acm_followers;
          CREATE POLICY "followers_self_delete" ON acm_followers FOR DELETE USING (auth.uid() = user_id);
          
          DROP POLICY IF EXISTS "followers_self_update" ON acm_followers;
          CREATE POLICY "followers_self_update" ON acm_followers FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
          
          DROP POLICY IF EXISTS "followers_public_read" ON acm_followers;
          CREATE POLICY "followers_public_read" ON acm_followers FOR SELECT USING (true);
          
          DROP POLICY IF EXISTS "followers_service_role" ON acm_followers;
          CREATE POLICY "followers_service_role" ON acm_followers FOR ALL USING (true);
          
          CREATE INDEX IF NOT EXISTS idx_followers_user_id ON acm_followers(user_id);
          CREATE INDEX IF NOT EXISTS idx_followers_created_at ON acm_followers(created_at);
          
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
          
          ALTER TABLE articles ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
          ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
        `
        
        await client.query(ddl)
        results.push('DDL executed successfully')
        
        const fc = await client.query('SELECT count(*) FROM acm_followers')
        results.push(`Followers count: ${fc.rows[0].count}`)
        
        client.release()
        await pool.end()
      } catch (e: any) {
        results.push(`${h.type} / ${pwd.substring(0, 8)}...: ${e.message.substring(0, 100)}`)
      }
    }
  }
  
  if (!connected) {
    results.push('Could not connect to database with any password/host combination')
  }
  
  return NextResponse.json({ results })
}
