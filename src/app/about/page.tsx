import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "About | APM Chibondo",
  description: "Arthur Chibondo — medical student, entrepreneur, digital creator, and mental health advocate from Malawi.",
};

const ventures = [
  {
    name: "Chibondo Academy",
    role: "Founder",
    desc: "An online learning platform helping Malawian students prepare for MSCE and beyond — closing the education gap one student at a time.",
    href: "#",
    tag: "Education",
  },
  {
    name: "Brandfletch Media",
    role: "Founder",
    desc: "A digital marketing and media company helping businesses grow online. Home to SaaS products including Brandfledger, NyasaDesk, and NyasaWallet.",
    href: "#",
    tag: "Media & Tech",
  },
  {
    name: "Arthur Chibondo Media",
    role: "Creator",
    desc: "My personal media platform — essays, interviews, and ideas on entrepreneurship, technology, medicine, and life in Malawi.",
    href: "/articles",
    tag: "Media",
  },
  {
    name: "Betting Addiction Support Malawi",
    role: "Founder",
    desc: "A mental health platform providing critical support, resources, and community for people struggling with betting addiction in Malawi.",
    href: "#",
    tag: "Mental Health",
  },
];

const saasProducts = [
  { name: "Brandfledger", desc: "Brand-building tools for African businesses." },
  { name: "NyasaDesk", desc: "AI-powered customer communication for the African market." },
  { name: "NyasaWallet", desc: "Digital payments and financial tools built for Malawi." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest block mb-4">About</span>
            <h1 className="text-4xl sm:text-6xl font-bold font-serif text-gray-900 dark:text-white mb-4">Arthur<br />Chibondo</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {["Medical Student", "Entrepreneur", "Digital Creator", "Mental Health Advocate"].map(tag => (
                <span key={tag} className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Building businesses. Studying medicine. Advocating for mental health. Making an impact in people's lives — in any way I can.
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <img
              src="https://media.base44.com/images/public/6a5b92f95ccce4d8e8c5bbe5/811a4bdd1_1768857984230.jpg"
              alt="Arthur Chibondo"
              className="w-72 h-80 object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">

        {/* Story */}
        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-5">My Story</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              I'm a medical student, entrepreneur, and digital creator from Malawi. My days are split between clinical training and building companies — and I wouldn't have it any other way.
            </p>
            <p>
              From an early age, I was obsessed with two things: understanding how the world works, and changing it. Medicine gave me the language for one; entrepreneurship gave me the tools for the other.
            </p>
            <p>
              Today I build businesses under <strong className="text-gray-800 dark:text-gray-200">Brandfletch Media</strong> — a growing portfolio of SaaS products and services built specifically for the African market. And through <strong className="text-gray-800 dark:text-gray-200">Chibondo Academy</strong>, I'm working to democratize quality education for students across Malawi.
            </p>
            <p>
              But the work I care most deeply about is in mental health. Betting addiction is a silent crisis in Malawi, destroying families and futures with very little support in sight. <strong className="text-gray-800 dark:text-gray-200">Betting Addiction Support Malawi</strong> exists to change that — providing real, accessible help to people who need it.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-5">What Drives Me</h2>
          <blockquote className="border-l-4 border-amber-600 pl-6 py-2">
            <p className="text-xl text-gray-700 dark:text-gray-300 font-serif italic leading-relaxed">
              "My passion is to make an impact in people's lives — in any way I can."
            </p>
          </blockquote>
          <p className="mt-5 text-gray-600 dark:text-gray-400 leading-relaxed">
            That's not a tagline. It's the reason I study medicine, build companies, create content, and advocate for mental health all at once. Every product I build, every article I write, every conversation I have is filtered through that one question: does this make someone's life better?
          </p>
        </div>

        {/* Ventures */}
        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-6">What I'm Building</h2>
          <div className="space-y-4">
            {ventures.map((v) => (
              <div key={v.name} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{v.tag}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{v.name}</h3>
                    <span className="text-xs text-gray-400">{v.role}</span>
                  </div>
                  {v.href !== "#" && (
                    <Link href={v.href} className="text-amber-600 hover:text-amber-700 flex-shrink-0 mt-1">
                      <ExternalLink size={16} />
                    </Link>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SaaS Products */}
        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">SaaS Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Built under Brandfletch Media</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {saasProducts.map((p) => (
              <div key={p.name} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-amber-600 p-8 text-white text-center">
          <h3 className="text-2xl font-bold font-serif mb-2">Let's connect</h3>
          <p className="text-amber-100 mb-6 text-sm leading-relaxed">
            Whether you want to collaborate, have a conversation about mental health, or just say hello — I'm always open.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-amber-700 font-semibold px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors">
            Get in Touch <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
