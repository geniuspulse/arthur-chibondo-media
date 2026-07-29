"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "./AuthModal";
import { ThumbsUp, Heart } from "lucide-react";

interface Props {
  slug: string;
  /** Show only the count text (e.g. "24 likes") */
  showCount?: boolean;
  /** Show only the like button */
  showButton?: boolean;
}

export default function ArticleLikes({ slug, showCount, showButton }: Props) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("article_likes").select("user_id").eq("article_slug", slug);
    setCount(data?.length || 0);
    setLiked(user ? (data || []).some((l: any) => l.user_id === user.id) : false);
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

  // Counts only (e.g. "👍 24 people liked this")
  if (showCount) {
    if (count === 0) return null;
    return (
      <span className="flex items-center gap-1.5 text-sm text-gray-400">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white">
          <ThumbsUp size={10} fill="white" />
        </span>
        {count} {count === 1 ? "person" : "people"} liked this
      </span>
    );
  }

  // Button only — shown in the action row (icon + count, no label)
  if (showButton) {
    return (
      <>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={load} />}
        <button
          onClick={toggle}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors group ${
            liked
              ? "text-blue-500"
              : "text-gray-500 hover:bg-gray-800 hover:text-white"
          }`}
        >
          <ThumbsUp size={20} fill={liked ? "currentColor" : "none"} className={`${loading ? "opacity-50" : ""} group-hover:scale-110 transition-transform`} />
          {count > 0 && <span className="text-sm font-medium">{count}</span>}
        </button>
      </>
    );
  }

  // Default — compact pill (backward compat)
  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={load} />}
      <button onClick={toggle} disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
          liked
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600"
            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
        }`}>
        <ThumbsUp size={15} fill={liked ? "currentColor" : "none"} />
        <span>{count > 0 ? count : ""} {liked ? "Liked" : "Like"}</span>
      </button>
    </>
  );
}
