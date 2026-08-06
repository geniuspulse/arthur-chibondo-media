import { supabase } from "@/lib/supabase";
import ArticleCard from "@/components/ArticleCard";

export const revalidate = 60;
export const metadata = { title: "Blog | Arthur Chibondo" };

const categories = ["All", "Entrepreneurship", "Technology & AI", "Education", "Business", "Malawi Development", "Personal Growth", "Politics & Society", "Media"];

export default async function ArticlesPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams?.category;
  let query = supabase.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false });
  if (category && category !== "All") query = query.eq("category", category);
  const { data: articles } = await query;

  return (
    <main className="min-h-screen">
      <section className="py-12 sm:py-20 px-4 sm:px-6 text-center bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <span className="text-gray-400 uppercase tracking-widest text-sm font-semibold mb-4 block">Writing</span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-gray-900 dark:text-white mb-3 sm:mb-4">The Blog</h1>
        <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
          Ideas, insights, and observations on entrepreneurship, technology, and building in Africa.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex flex-wrap gap-2 mb-8 sm:mb-12">
          {categories.map((c) => (
            <a key={c} href={c === "All" ? "/articles" : `/articles?category=${encodeURIComponent(c)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                (c === "All" && !category) || c === category
                  ? "bg-white text-gray-900 font-semibold"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >{c}</a>
          ))}
        </div>
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-24 text-gray-500">No articles found.</div>
        )}
      </section>
    </main>
  );
}
