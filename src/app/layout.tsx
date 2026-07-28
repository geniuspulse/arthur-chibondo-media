import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import AdRenderer from "@/components/AdRenderer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL('https://arthur-chibondo-media.vercel.app'),
  title: {
    default: 'APM Chibondo | Entrepreneur, Medical Student & Digital Creator from Malawi',
    template: '%s | APM Chibondo',
  },
  description: 'APM Chibondo — Arthur Chibondo is a Malawian entrepreneur, medical student, and digital creator building Chibondo Academy, Brandfletch Media, and NyasaDesk. Exploring technology, business, education, and Malawi\'s future.',
  keywords: ['APM Chibondo', 'Arthur Chibondo', 'Malawian entrepreneur', 'Malawi technology', 'Chibondo Academy', 'Brandfletch Media', 'NyasaDesk', 'Malawi digital creator', 'medical student Malawi', 'Malawi business'],
  authors: [{ name: 'Arthur Chibondo', url: 'https://arthur-chibondo-media.vercel.app' }],
  creator: 'Arthur Chibondo',
  publisher: 'APM Chibondo',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    url: 'https://arthur-chibondo-media.vercel.app',
    locale: 'en_US',
    siteName: 'APM Chibondo',
    title: 'APM Chibondo | Entrepreneur, Medical Student & Digital Creator from Malawi',
    description: 'Building, Learning, and Sharing Ideas from Malawi.',
    images: [{ url: 'https://uktgbtzlkgxrhrzcvnal.supabase.co/storage/v1/object/public/article-images/1785281966742-6ccq9ggvwbw.jpg', width: 1200, height: 630, alt: 'Arthur Chibondo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APM Chibondo',
    description: 'Entrepreneur, Medical Student & Digital Creator from Malawi.',
    images: ['https://uktgbtzlkgxrhrzcvnal.supabase.co/storage/v1/object/public/article-images/1785281966742-6ccq9ggvwbw.jpg'],
  },
  alternates: { canonical: 'https://arthur-chibondo-media.vercel.app' },
  verification: {},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Arthur Chibondo",
    "alternateName": "APM Chibondo",
    "url": "https://arthur-chibondo-media.vercel.app",
    "image": "https://uktgbtzlkgxrhrzcvnal.supabase.co/storage/v1/object/public/article-images/1785281966742-6ccq9ggvwbw.jpg",
    "jobTitle": "Entrepreneur, Medical Student & Digital Creator",
    "nationality": "Malawian",
    "sameAs": [],
    "worksFor": [
      {"@type": "Organization", "name": "Chibondo Academy"},
      {"@type": "Organization", "name": "Brandfletch Media"},
      {"@type": "Organization", "name": "NyasaDesk"}
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden`}>
        <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AdRenderer placement="header" /><ConditionalNavbar>{children}</ConditionalNavbar>
        </ThemeProvider>
        </AuthProvider>
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('click', function(e) {
            var btn = e.target.closest('.copy-link-btn');
            if (!btn) return;
            var url = btn.getAttribute('data-copy-url');
            if (!url) return;
            navigator.clipboard.writeText(url).then(function() {
              var orig = btn.innerHTML;
              btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
              setTimeout(function() { btn.innerHTML = orig; }, 2000);
            });
          });
        ` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
