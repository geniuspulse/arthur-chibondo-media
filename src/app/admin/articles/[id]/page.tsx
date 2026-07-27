"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ArticleEditor from "@/components/admin/ArticleEditor";

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("articles").select("*").eq("id", params.id).single().then(({ data }) => {
      setArticle(data);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!article) return <p className="text-center py-16 text-gray-400">Article not found.</p>;

  return <ArticleEditor article={article} />;
}
