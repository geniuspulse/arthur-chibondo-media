import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ConditionalNavbar from "@/components/ConditionalNavbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: {
    default: "APM Chibondo | Entrepreneur & Digital Creator from Malawi",
    template: "%s | APM Chibondo",
  },
  description: "APM Chibondo — Arthur Chibondo is a Malawian entrepreneur, digital creator, and builder exploring technology, education, business, and the future of Malawi.",
  keywords: ["APM Chibondo", "Arthur Chibondo", "Malawian entrepreneur", "Malawi technology", "Chibondo Academy", "Brandfletch", "NyasaDesk", "APM Chibondo"],
  authors: [{ name: "Arthur Chibondo" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "APM Chibondo",
    title: "APM Chibondo | Entrepreneur & Digital Creator from Malawi",
    description: "Building, Learning, and Sharing Ideas from Malawi.",
    images: [
      {
        url: "https://media.base44.com/images/public/6a5b92f95ccce4d8e8c5bbe5/811a4bdd1_1768857984230.jpg",
        width: 1200,
        height: 630,
        alt: "Arthur Chibondo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "APM Chibondo",
    description: "Entrepreneur, Digital Creator, and Builder from Malawi.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ConditionalNavbar>{children}</ConditionalNavbar>
        </ThemeProvider>
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
      </body>
    </html>
  );
}
