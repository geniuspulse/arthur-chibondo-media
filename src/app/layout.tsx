import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: {
    default: "Arthur Chibondo | Entrepreneur & Digital Creator from Malawi",
    template: "%s | Arthur Chibondo",
  },
  description: "Arthur Chibondo is a Malawian entrepreneur, digital creator, and builder exploring technology, education, business, and the future of Malawi.",
  keywords: ["Arthur Chibondo", "Malawian entrepreneur", "Malawi technology", "Chibondo Academy", "Brandfletch", "NyasaDesk", "Arthur Chibondo Media"],
  authors: [{ name: "Arthur Chibondo" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Arthur Chibondo",
    title: "Arthur Chibondo | Entrepreneur & Digital Creator from Malawi",
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
    title: "Arthur Chibondo",
    description: "Entrepreneur, Digital Creator, and Builder from Malawi.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <div className="min-h-screen">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
