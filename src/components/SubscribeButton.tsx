"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "./AuthModal";
import { Bell, Check, Loader2 } from "lucide-react";

interface Props {
  variant?: "nav" | "hero" | "compact";
}

export default function SubscribeButton({ variant = "nav" }: Props) {
  const { user, profile } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if current user is subscribed
  useEffect(() => {
    if (!user) { setSubscribed(false); return; }
    supabase
      .from("acm_followers")
      .select("id")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setSubscribed(!!data));
  }, [user]);

  // Fetch follower count (public)
  useEffect(() => {
    supabase
      .from("acm_followers")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setFollowerCount(count ?? 0));
  }, [subscribed]);

  const handleSubscribe = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (subscribed) return;

    setLoading(true);
    const { error } = await supabase.from("acm_followers").insert({
      user_id: user.id,
      email: user.email,
      display_name: profile?.display_name || user.email?.split("@")[0],
    });
    setLoading(false);

    if (!error) setSubscribed(true);
  };

  const handleUnsubscribe = async () => {
    if (!user || !subscribed) return;
    setLoading(true);
    const { error } = await supabase
      .from("acm_followers")
      .delete()
      .eq("user_id", user.id);
    setLoading(false);
    if (!error) setSubscribed(false);
  };

  const baseClasses = {
    nav: "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all",
    hero: "flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold transition-all",
    compact: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
  };

  if (subscribed) {
    return (
      <>
        <button
          onClick={handleUnsubscribe}
          disabled={loading}
          className={`${baseClasses[variant]} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700`}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          <span>Subscribed</span>
          {followerCount !== null && variant !== "compact" && (
            <span className="ml-1 text-gray-400">· {followerCount}</span>
          )}
        </button>
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`${baseClasses[variant]} bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 border border-gray-900 dark:border-white disabled:opacity-60`}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
        <span>Subscribe</span>
        {followerCount !== null && followerCount > 0 && variant !== "compact" && (
          <span className="ml-1 opacity-60">· {followerCount}</span>
        )}
      </button>
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          defaultView="signup"
          onSuccess={handleSubscribe}
        />
      )}
    </>
  );
}
