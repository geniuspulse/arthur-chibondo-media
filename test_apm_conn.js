const { Pool } = require('pg')

async function main() {
  const projectRef = 'uktgbtzlkgxrhrzcvnal'
  const passwords = ['Arthur@472003', 'Arthur@472003Chibondo', 'postgres']
  const hosts = [
    { type: 'pooler-us-east-1', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-eu-west-1', host: 'aws-0-eu-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  ]

  for (const h of hosts) {
    for (const pwd of passwords) {
      try {
        const pool = new Pool({
          host: h.host, database: 'postgres', user: h.user, password: pwd,
          port: h.port, connectionTimeoutMillis: 8000, ssl: { rejectUnauthorized: false },
        })
        const client = await pool.connect()
        console.log(`Connected via ${h.type} with password: ${pwd.substring(0, 12)}...`)
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS acm_followers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL UNIQUE,
            email TEXT,
            display_name TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
          );
          ALTER TABLE acm_followers ENABLE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS "followers_self_insert" ON acm_followers;
          CREATE POLICY "followers_self_insert" ON acm_followers FOR INSERT WITH CHECK (auth.uid() = user_id);
          DROP POLICY IF EXISTS "followers_self_delete" ON acm_followers;
          CREATE POLICY "followers_self_delete" ON acm_followers FOR DELETE USING (auth.uid() = user_id);
          DROP POLICY IF EXISTS "followers_public_read" ON acm_followers;
          CREATE POLICY "followers_public_read" ON acm_followers FOR SELECT USING (true);
          DROP POLICY IF EXISTS "followers_service_role" ON acm_followers;
          CREATE POLICY "followers_service_role" ON acm_followers FOR ALL USING (true);
          CREATE INDEX IF NOT EXISTS idx_followers_user_id ON acm_followers(user_id);
        `)
        console.log('acm_followers table created')
        
        await client.query(`
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
        `)
        console.log('article_analytics table created')
        
        await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;`)
        await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;`)
        console.log('articles columns updated')
        
        const fc = await client.query('SELECT count(*) FROM acm_followers')
        console.log(`Followers count: ${fc.rows[0].count}`)
        
        client.release()
        await pool.end()
        process.exit(0)
      } catch (e) {
        console.log(`FAIL ${h.type} / ${pwd.substring(0, 12)}: ${e.message.substring(0, 80)}`)
      }
    }
  }
  console.log('Could not connect with any combination')
  process.exit(1)
}

main()
