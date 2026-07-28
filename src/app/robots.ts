export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin/' },
    sitemap: 'https://arthur-chibondo-media.vercel.app/sitemap.xml',
  };
}
