import { supabase } from "@/lib/supabase";
import HeroSection from "@/components/HeroSection";
import ArticleCard from "@/components/ArticleCard";
import ProjectCard from "@/components/ProjectCard";
import NewsletterForm from "@/components/NewsletterForm";
import Link from "next/link";
import { ArrowRight, Heart, BookOpen, Cpu, Building2, Stethoscope } from "lucide-react";
import AdRenderer from "@/components/AdRenderer";

export const revalidate = 30;

const pillars = [
  {
    icon: <Stethoscope size={22} className="text-amber-600" />,
    title: "Medicine",
    desc: "Medical student committed to understanding the science of life — because health is the foundation of everything.",
  },
  {
    icon: <Building2 size={22} className="text-amber-600" />,
    title: "Entrepreneurship",
    desc: "Founder of Chibondo Academy, Brandfletch Media, and a growing portfolio of SaaS products built for Africa.",
  },
  {
    icon: <Cpu size={22} className="text-amber-600" />,
    title: "Digital Creation",
    desc: "Writer, content creator, and builder sharing ideas on technology, business, and life in Malawi.",
  },
  {
    icon: <Heart size={22} className="text-amber-600" />,
    title: "Mental Health",
    desc: "Founder of Betting Addiction Support Malawi — providing critical support to those who need it most.",
  },
];

const topics = [
  "Entrepreneurship", "Technology & AI", "Education",
  "Business", "Malawi Development", "Personal Growth",
  "Mental Health", "Medicine & Health",
];

export default async function HomePage() {
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("is_featured", true)
    .order("display_order")
    .limit(3);

  return (
    <main>
      <HeroSection />

      {/* What I Do — 4 pillars */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest block mb-2">What I Do</span>
            <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Four worlds, one mission</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              My work cuts across medicine, business, technology, and advocacy — all driven by the same belief: that one person can meaningfully change lives.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p) => (
              <div key={p.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest block mb-2">From the Blog</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white">Latest Articles</h2>
          </div>
          <Link href="/articles" className="hidden sm:flex items-center gap-2 text-amber-600 font-medium hover:gap-3 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles?.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {(!articles || articles.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-12">Articles coming soon.</p>
          )}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/articles" className="inline-flex items-center gap-2 text-amber-600 font-medium">
            View All Articles <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <AdRenderer placement="in-article" className="max-w-6xl mx-auto px-4 sm:px-6 py-4" />

      {/* About Snippet */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 sm:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest block mb-3">About Arthur</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white mb-5 leading-tight">
              Making an impact — one life at a time.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Arthur is a medical student, entrepreneur, and digital creator from Malawi. He builds companies that educate, empower, and connect — and advocates fiercely for mental health in communities that need it most.
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
              My Full Story <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex justify-center">
            <img
              src="https://uktgbtzlkgxrhrzcvnal.supabase.co/storage/v1/object/public/article-images/1785281252973-afhiadspkda.png"
              alt="Arthur Chibondo"
              className="w-64 h-64 rounded-2xl object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest block mb-2">Portfolio</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white">Featured Projects</h2>
            </div>
            <Link href="/projects" className="hidden sm:flex items-center gap-2 text-amber-600 font-medium hover:gap-3 transition-all">
              All Projects <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <AdRenderer placement="footer" className="max-w-6xl mx-auto px-4 sm:px-6 pt-4" />
        </section>
      )}

      {/* Topics */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest block mb-3">Interests</span>
          <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mb-8">Topics I Write About</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {topics.map((topic) => (
              <Link
                key={topic}
                href={`/articles?category=${encodeURIComponent(topic)}`}
                className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-600 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest block mb-3">Newsletter</span>
        <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white mb-4">
          Ideas to Your Inbox
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Join the newsletter for thoughts on entrepreneurship, medicine, mental health, and building in Africa.
        </p>
        <NewsletterForm />
      </section>
    </main>
  );
}
