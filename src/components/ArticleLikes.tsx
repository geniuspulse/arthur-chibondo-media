"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "./AuthModal";
import { Heart } from "lucide-react";

export default function ArticleLikes({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("article_likes").select("user_id").eq("article_slug", slug);
    setCount(data?.length || 0);
    setLiked(user ? (data || []).some(l => l.user_id === user.id) : false);
  };

  useEffect(() => { load(); }, [slug, user]);

  const toggle = async () => {
    if (!user) { setShowAuth(true); return; }
    setLoading(true);
    if (liked) {
      await supabase.from("article_likes").delete().eq("article_slug", slug).eq("user_id", user.id);
    } else {
      await supabase.from("article_likes").insert({ article_slug: slug, user_id: user.id });
    }
    setLoading(false);
    load();
  };

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={load} />}
      <button onClick={toggle} disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${liked ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-300 hover:text-red-500"}`}>
        <Heart size={15} fill={liked ? "currentColor" : "none"} className={loading ? "opacity-50" : ""} />
        <span>{count > 0 ? count : ""} {liked ? "Liked" : "Like"}</span>
      </button>
    </>
  );
}
