import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

export const revalidate = 60;

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase.from("articles").select("*").eq("slug", params.slug).eq("status", "published").single();
  if (!article) notFound();

  const { data: related } = await supabase.from("articles").select("*").eq("status", "published").eq("category", article.category).neq("slug", params.slug).limit(2);

  return (
    <main>
      <div className="relative w-full h-72 sm:h-96 overflow-hidden bg-gray-100 dark:bg-gray-900">
        {article.cover_image && <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-3xl mx-auto px-6 pb-10 w-full">
            <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">{article.category}</span>
            <h1 className="text-2xl sm:text-4xl font-bold text-white font-serif leading-tight">{article.title}</h1>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 mb-8"><ArrowLeft size={16} /> Back to Blog</Link>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <span className="flex items-center gap-1"><Calendar size={14} />{new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span className="flex items-center gap-1"><Clock size={14} />{article.reading_time} min read</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">By {article.author}</span>
        </div>
        <div className="space-y-6">
          {article.content?.split("\n\n").map((para: string, i: number) => (
            <p key={i} className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{para}</p>
          ))}
        </div>
        <div className="mt-12 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex gap-5 items-start">
          <img src="https://media.base44.com/images/public/6a5b92f95ccce4d8e8c5bbe5/811a4bdd1_1768857984230.jpg" alt="Arthur Chibondo" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Arthur Chibondo</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Malawian entrepreneur, digital creator, and builder. Founder of Chibondo Academy, Brandfletch Media, and NyasaDesk.</p>
          </div>
        </div>
        {related && related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-8">Related Articles</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((r: any) => (
                <Link key={r.id} href={`/articles/${r.slug}`} className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors">
                  <span className="text-xs font-semibold text-blue-600 block mb-1">{r.category}</span>
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{r.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
