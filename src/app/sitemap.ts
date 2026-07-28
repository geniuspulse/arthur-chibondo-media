import { supabase } from '@/lib/supabase';

export default async function sitemap() {
  const base = 'https://arthur-chibondo-media.vercel.app';
  
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('status', 'published');
  
  const { data: projects } = await supabase
    .from('projects')
    .select('slug, updated_at');

  const staticRoutes = ['', '/about', '/articles', '/projects', '/media', '/contact'].map(r => ({
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

  const projectRoutes = (projects || []).map(p => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...projectRoutes];
}
