export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin/' },
    sitemap: 'https://apmchibondo.blog/sitemap.xml',
  };
}
