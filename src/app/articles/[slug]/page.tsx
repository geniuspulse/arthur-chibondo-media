import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import AdRenderer from "@/components/AdRenderer";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import CommentsSection from "@/components/CommentsSection";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, cover_image, category, author, published_at, slug")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!article) return { title: "Article Not Found" };

  const url = `https://arthur-chibondo-media.vercel.app/articles/${article.slug}`;
  const image = article.cover_image || "https://media.base44.com/images/public/6a5b92f95ccce4d8e8c5bbe5/811a4bdd1_1768857984230.jpg";

  return {
    title: article.title,
    description: article.excerpt || `Read "${article.title}" by ${article.author} on APM Chibondo.`,
    openGraph: {
      title: article.title,
      description: article.excerpt || `Read "${article.title}" by ${article.author} on APM Chibondo.`,
      url,
      siteName: "APM Chibondo",
      type: "article",
      publishedTime: article.published_at,
      authors: [article.author],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || `Read "${article.title}" by ${article.author} on APM Chibondo.`,
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
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();
  if (!article) notFound();

  const { data: related } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("category", article.category)
    .neq("slug", params.slug)
    .limit(2);

  const articleUrl = `https://arthur-chibondo-media.vercel.app/articles/${article.slug}`;

  return (
    <main>
      {/* Hero cover */}
      <div className="relative w-full h-56 sm:h-80 overflow-hidden bg-gray-100 dark:bg-gray-900">
        {article.cover_image && (
          <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8 w-full">
            <span className="inline-block bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
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
        <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-500 mb-6">
          <ArrowLeft size={15} /> Back to Blog
        </Link>

        {/* Meta + Share row */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Calendar size={13} />
            {new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock size={13} />
            {article.reading_time} min read
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">By {article.author}</span>

          {/* Share buttons - push to right on desktop */}
          <div className="sm:ml-auto flex items-center gap-2">
            <ShareButtons url={articleUrl} title={article.title} />
          </div>
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
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-amber-600 prose-img:rounded-xl prose-img:max-w-full prose-table:w-full"
            dangerouslySetInnerHTML={{ __html: article.content || "" }}
          />
        </div>

        <AdRenderer placement="in-article" className="my-8" />

        {/* Author bio */}
        <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex gap-4 items-start">
          <img
            src="https://media.base44.com/images/public/6a5b92f95ccce4d8e8c5bbe5/811a4bdd1_1768857984230.jpg"
            alt="Arthur Chibondo"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Arthur Chibondo</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Malawian entrepreneur, digital creator, and builder. Founder of Chibondo Academy, Brandfletch Media, and NyasaDesk.
            </p>
          </div>
        </div>

        <AdRenderer placement="sidebar" className="my-8" />

        {/* Share again at bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Share this post</p>
          <div className="flex flex-wrap gap-2">
            <ShareButtons url={articleUrl} title={article.title} showLabels />
          </div>
        </div>

        {/* Comments */}
        <CommentsSection slug={article.slug} />

        {/* Related articles */}
        {related && related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r: any) => (
                <Link
                  key={r.id}
                  href={`/articles/${r.slug}`}
                  className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-amber-500 transition-colors"
                >
                  <span className="text-xs font-semibold text-amber-600 block mb-1">{r.category}</span>
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors leading-snug">
                    {r.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ---- Share Buttons (client component workaround via inline server rendering) ----
function ShareButtons({ url, title, showLabels = false }: { url: string; title: string; showLabels?: boolean }) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-gray-700 dark:text-gray-300 hover:text-amber-700 text-xs font-medium transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
        {showLabels && "Twitter"}
      </a>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-700 dark:text-gray-300 hover:text-green-700 text-xs font-medium transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.858L.046 24l6.293-1.631A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.823 9.823 0 01-5.003-1.368l-.36-.213-3.714.962.993-3.614-.236-.374A9.808 9.808 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/></svg>
        {showLabels && "WhatsApp"}
      </a>
      <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-700 text-xs font-medium transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        {showLabels && "Facebook"}
      </a>
      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-700 text-xs font-medium transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        {showLabels && "LinkedIn"}
      </a>
      {showLabels && (
        <CopyLinkButton url={url} />
      )}
    </>
  );
}

// Need client component for copy - inline it here as a server-compatible link
function CopyLinkButton({ url }: { url: string }) {
  // Rendered as a regular link for server-side; client interaction via onclick
  return (
    <button
      onClick={undefined}
      data-copy-url={url}
      className="copy-link-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-gray-700 dark:text-gray-300 hover:text-amber-700 text-xs font-medium transition-colors"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
      Copy Link
    </button>
  );
}
