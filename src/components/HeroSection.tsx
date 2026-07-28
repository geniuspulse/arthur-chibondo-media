"use client";

import Link from "next/link";
import { Twitter, Linkedin, Instagram, Youtube, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const socials = [
  { icon: <Twitter size={18} />, label: "Twitter", href: "https://twitter.com/arthurchibondo" },
  { icon: <Linkedin size={18} />, label: "LinkedIn", href: "https://linkedin.com/in/arthurchibondo" },
  { icon: <Instagram size={18} />, label: "Instagram", href: "https://instagram.com/arthurchibondo" },
  { icon: <Youtube size={18} />, label: "YouTube", href: "https://youtube.com/@arthurchibondo" },
];

const tags = ["Medical Student", "Entrepreneur", "Digital Creator", "Mental Health Advocate"];

export default function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
      {/* Text */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <span className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-semibold px-3 py-1 rounded-full mb-6">
          🇲🇼 Building from Malawi
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-gray-900 dark:text-white leading-tight mb-4">
          Arthur<br />Chibondo
        </h1>

        {/* Identity tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map(tag => (
            <span key={tag} className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-lg">
          Medical student by training. Entrepreneur and digital creator by calling. I build companies, share ideas, and advocate for mental health — all in pursuit of making a real impact in people's lives.
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Read My Blog <ArrowRight size={16} />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-600 hover:text-amber-600 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Explore Projects
          </Link>
        </div>

        <div className="flex gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 transition-colors"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </motion.div>

      {/* Photo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="flex justify-center lg:justify-end"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-amber-600 rounded-2xl translate-x-3 translate-y-3 opacity-20" />
          <img
            src="https://media.base44.com/images/public/6a5b92f95ccce4d8e8c5bbe5/811a4bdd1_1768857984230.jpg"
            alt="Arthur Chibondo"
            className="relative w-72 h-80 sm:w-80 sm:h-96 object-cover rounded-2xl shadow-2xl"
          />
          <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-lg border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Based in</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">🇲🇼 Malawi, Africa</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
