import { supabase } from '@/lib/supabase';

export default async function sitemap() {
  const base = 'https://apmchibondo.vercel.app';
  
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('status', 'published');

  const staticRoutes = ['', '/about', '/articles', '/media', '/contact'].map(r => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: r === '' ? 1 : 0.8,
  }));

  const articleRoutes = (articles || []).map(a => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
