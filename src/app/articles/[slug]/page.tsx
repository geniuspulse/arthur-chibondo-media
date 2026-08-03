import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import AdRenderer from "@/components/AdRenderer";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import CommentsSection from "@/components/CommentsSection";
import ArticleLikes from "@/components/ArticleLikes";
import ArticleViewTracker from "@/components/ArticleViewTracker";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, content, cover_image, category, author, published_at, slug")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!article) return { title: "Article Not Found" };

  const url = `https://arthur-chibondo-media.vercel.app/articles/${article.slug}`;
  const image = article.cover_image || "https://uktgbtzlkgxrhrzcvnal.supabase.co/storage/v1/object/public/article-images/1785281966742-6ccq9ggvwbw.jpg";
  const desc = article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : "") || "APM Chibondo article";

  return {
    title: article.title,
    description: desc,
    openGraph: {
      title: article.title,
      description: desc,
      url,
      siteName: "APM Chibondo",
      type: "article",
      publishedTime: article.published_at,
      authors: [article.author],
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: desc,
      images: [image],
    },
  };
}

export async function generateStaticParams() {
  const { data } = await supabase.from("articles").select("slug").eq("status", "published");
  return (data || []).map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase
    .from("articles").select("*").eq("slug", params.slug).eq("status", "published").single();
  if (!article) notFound();

  const { data: related } = await supabase
    .from("articles").select("*").eq("status", "published")
    .eq("category", article.category).neq("slug", params.slug).limit(2);

  const articleUrl = `https://arthur-chibondo-media.vercel.app/articles/${article.slug}`;

  return (
    <main>
      <ArticleViewTracker slug={article.slug} />
      {/* Hero cover */}
      <div className="relative w-full h-56 sm:h-80 overflow-hidden bg-gray-900">
        {article.cover_image && (
          <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8 w-full">
            <span className="inline-block bg-gray-800 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              {article.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold text-white font-serif leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back link */}
        <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={15} /> Back to Blog
        </Link>

        {/* Meta row — just date, time, author (no like/share) */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-800">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Calendar size={13} />
            {new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock size={13} />
            {article.reading_time} min read
          </span>
          <span className="font-medium text-gray-300 whitespace-nowrap">By {article.author}</span>
        </div>

        {/* YouTube embed */}
        {article.youtube_video_id && (
          <div className="mb-10">
            <YouTubeEmbed videoId={article.youtube_video_id} title={article.title} />
          </div>
        )}

        {/* Article body */}
        <div className="overflow-x-auto">
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-white hover:prose-a:underline prose-img:rounded-xl prose-img:max-w-full prose-table:w-full"
            dangerouslySetInnerHTML={{ __html: article.content || "" }}
          />
        </div>

        <AdRenderer placement="in-article" className="my-8" />

        {/* Author bio */}
        <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-gray-900 border border-gray-800 flex gap-4 items-start">
          <img
            src="https://uktgbtzlkgxrhrzcvnal.supabase.co/storage/v1/object/public/article-images/1785281252973-afhiadspkda.png"
            alt="Arthur Chibondo"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <p className="font-semibold text-white">Arthur Chibondo</p>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Malawian entrepreneur, digital creator, and builder. Founder of Chibondo Academy, Brandfletch Media, and NyasaDesk.
            </p>
          </div>
        </div>

        <AdRenderer placement="sidebar" className="my-8" />

        {/* ─── Facebook-style engagement bar ─── */}
        <div className="mt-12 rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden">
          {/* Counts row */}
          <div className="flex items-center justify-between px-4 py-2.5 text-xs text-gray-500 border-b border-gray-800">
            <ArticleLikes slug={article.slug} showCount />
            <a href="#comments" className="hover:text-gray-300 transition-colors">Comments ↓</a>
          </div>
          {/* Action buttons — Like | WhatsApp | Twitter | Facebook */}
          <div className="flex items-stretch divide-x divide-gray-800">
            <ArticleLikes slug={article.slug} showButton />
            <ShareButtons url={articleUrl} title={article.title} />
          </div>
        </div>

        {/* Comments */}
        <div id="comments">
          <CommentsSection slug={article.slug} />
        </div>

        {/* Related articles */}
        {related && related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r: any) => (
                <Link
                  key={r.id}
                  href={`/articles/${r.slug}`}
                  className="group p-4 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1">{r.category}</span>
                  <p className="font-semibold text-gray-200 group-hover:text-white transition-colors leading-snug">{r.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ── Share Buttons — icon-only with brand colors + native share fallback ──
function ShareButtons({ url, title }: { url: string; title: string }) {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;
  const twitterUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <>
      {/* WhatsApp — brand green #25D366 */}
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
        className="flex-1 flex items-center justify-center py-3 text-gray-500 hover:bg-gray-800 transition-colors group">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366" className="group-hover:scale-110 transition-transform">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.113.549 4.099 1.51 5.824L0 24l6.335-1.492A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
        </svg>
      </a>
      {/* X / Twitter — brand black #000000 (shown as white on dark bg) */}
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on X"
        className="flex-1 flex items-center justify-center py-3 text-gray-500 hover:bg-gray-800 transition-colors group">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white group-hover:scale-110 transition-transform">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
        </svg>
      </a>
      {/* Facebook — brand blue #1877F2 */}
      <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"
        className="flex-1 flex items-center justify-center py-3 text-gray-500 hover:bg-gray-800 transition-colors group">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2" className="group-hover:scale-110 transition-transform">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      {/* Copy link — uses the global copy-link-btn listener already in layout.tsx */}
      <button
        type="button"
        aria-label="Copy link"
        data-copy-url={url}
        className="copy-link-btn flex-1 flex items-center justify-center py-3 text-gray-500 hover:bg-gray-800 hover:text-white transition-colors group">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
      </button>
    </>
  );
}
