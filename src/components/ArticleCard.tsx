"use client";

import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image?: string;
  category: string;
  reading_time: number;
  published_at: string;
  author: string;
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 h-full flex flex-col">
        {article.cover_image ? (
          <div className="relative h-40 sm:h-48 overflow-hidden">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
            <span className="text-4xl font-bold font-serif text-gray-300 dark:text-gray-600">{article.title[0]}</span>
          </div>
        )}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full mb-3 w-fit">
            {article.category}
          </span>
          <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-snug mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors line-clamp-2 flex-1">
            {article.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 sm:mb-4">{article.excerpt}</p>
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-400 dark:text-gray-500 mt-auto">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {article.reading_time} min read
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
