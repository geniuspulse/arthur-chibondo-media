import { supabase } from "@/lib/supabase";
import HeroSection from "@/components/HeroSection";
import ArticleCard from "@/components/ArticleCard";
import NewsletterForm from "@/components/NewsletterForm";
import Link from "next/link";
import { ArrowRight, BookOpen, Cpu, Building2, Stethoscope } from "lucide-react";
import AdRenderer from "@/components/AdRenderer";

export const revalidate = 30;

const pillars = [
  {
    icon: <Stethoscope size={22} className="text-gray-300" />,
    title: "Medical Student",
    desc: "In the middle of medical school, wrestling with everything that comes with learning to take care of people.",
  },
  {
    icon: <Building2 size={22} className="text-gray-300" />,
    title: "Entrepreneur",
    desc: "Building things on the side — from Chibondo Academy to a few products still finding their shape.",
  },
  {
    icon: <Cpu size={22} className="text-gray-300" />,
    title: "Digital Creator",
    desc: "Writing and sharing ideas as I go — tech, business, mental health, and life in Malawi.",
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
    .neq("status", "deleted")
    .order("published_at", { ascending: false })
    .limit(6);

  return (
    <main>
      <HeroSection />

      {/* A Bit About Me — 3 pillars */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <span className="text-gray-400 uppercase tracking-widest text-sm font-semibold block mb-2">A Bit About Me</span>
            <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Three things I'm always juggling</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              I'm not one thing. This blog is where med school, building stuff, and just figuring life out all show up in one place.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {pillars.map((p) => (
              <div key={p.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center mb-4">
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
            <span className="text-gray-400 uppercase tracking-widest text-sm font-semibold block mb-2">From the Blog</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white">Latest Articles</h2>
          </div>
          <Link href="/articles" className="hidden sm:flex items-center gap-2 text-gray-400 hover:text-white font-medium hover:gap-3 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles?.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {(!articles || articles.length === 0) && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
              <BookOpen className="mx-auto text-gray-500 mb-3" size={32} />
              <p className="text-gray-400">Articles coming soon.</p>
            </div>
          )}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/articles" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors">
            View All Articles <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <AdRenderer placement="in-article" className="max-w-6xl mx-auto px-4 sm:px-6 py-4" />

      {/* About Snippet */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 sm:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-gray-400 uppercase tracking-widest text-sm font-semibold block mb-3">About Arthur</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white mb-5 leading-tight">
              Just a guy documenting the journey.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Arthur is a medical student from Malawi who also builds things and writes about it. This site is less a portfolio and more a running log of what he's learning, building, and thinking about — in medicine, business, and everything in between.
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-semibold px-5 py-2.5 rounded-xl transition-colors">
              My Full Story <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex justify-center">
            <img
              src="https://base44.app/api/apps/6a6714790901338a9a9ed78a/files/mp/public/6a6714790901338a9a9ed78a/9b000978e_arthur_new_photo.jpg"
              alt="Arthur Chibondo"
              className="w-64 h-64 rounded-2xl object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <span className="text-gray-400 uppercase tracking-widest text-sm font-semibold block mb-3">Interests</span>
          <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mb-8">Topics I Write About</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {topics.map((topic) => (
              <Link
                key={topic}
                href={`/articles?category=${encodeURIComponent(topic)}`}
                className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-white hover:text-white transition-colors"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <span className="text-gray-400 uppercase tracking-widest text-sm font-semibold block mb-3">Newsletter</span>
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
