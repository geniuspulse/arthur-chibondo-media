import { supabase } from "@/lib/supabase";
import HeroSection from "@/components/HeroSection";
import ArticleCard from "@/components/ArticleCard";
import ProjectCard from "@/components/ProjectCard";
import NewsletterForm from "@/components/NewsletterForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const topics = [
  "Entrepreneurship", "Technology & AI", "Education",
  "Business", "Malawi Development", "Personal Growth",
  "Politics & Society", "Media"
];

export const revalidate = 60;

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

      {/* Latest Articles */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-green-600 text-sm font-semibold uppercase tracking-widest block mb-2">From the Blog</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white">Latest Articles</h2>
          </div>
          <Link href="/articles" className="hidden sm:flex items-center gap-2 text-green-600 font-medium hover:gap-3 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles?.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {(!articles || articles.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-12">Articles coming soon.</p>
          )}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/articles" className="inline-flex items-center gap-2 text-green-600 font-medium">
            View All Articles <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* About Snippet */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-20 grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-green-600 text-sm font-semibold uppercase tracking-widest block mb-3">About Arthur</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white mb-5 leading-tight">
              Building for Malawi. Thinking for Africa.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Arthur Chibondo is a Malawian entrepreneur and digital creator building technology solutions in education, marketing, and media. Founder of Chibondo Academy, Brandfletch Media, and NyasaDesk.
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Learn More <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex justify-center">
            <img
              src="https://media.base44.com/images/public/6a5b92f95ccce4d8e8c5bbe5/811a4bdd1_1768857984230.jpg"
              alt="Arthur Chibondo"
              className="w-64 h-64 rounded-2xl object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-green-600 text-sm font-semibold uppercase tracking-widest block mb-2">Portfolio</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white">Featured Projects</h2>
          </div>
          <Link href="/projects" className="hidden sm:flex items-center gap-2 text-green-600 font-medium hover:gap-3 transition-all">
            All Projects <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <span className="text-green-600 text-sm font-semibold uppercase tracking-widest block mb-3">Interests</span>
          <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mb-8">Topics I Write About</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {topics.map((topic) => (
              <Link
                key={topic}
                href={`/articles?category=${encodeURIComponent(topic)}`}
                className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-green-600 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <span className="text-green-600 text-sm font-semibold uppercase tracking-widest block mb-3">Newsletter</span>
        <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white mb-4">
          Ideas to Your Inbox
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Join my newsletter for insights on entrepreneurship, technology, and building in Africa.
        </p>
        <NewsletterForm />
      </section>
    </main>
  );
}
