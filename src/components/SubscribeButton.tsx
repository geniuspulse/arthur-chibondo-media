"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "./AuthModal";
import { Bell, Check, Loader2, BellRing } from "lucide-react";

interface Props {
  variant?: "nav" | "hero" | "compact";
}

export default function SubscribeButton({ variant = "nav" }: Props) {
  const { user, profile } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if current user is subscribed
  useEffect(() => {
    if (!user) {
      setSubscribed(false);
      setNotificationsEnabled(false);
      return;
    }
    supabase
      .from("acm_followers")
      .select("id, notifications_enabled")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setSubscribed(!!data);
        setNotificationsEnabled(data?.notifications_enabled ?? false);
      });
  }, [user]);

  // Fetch follower count (public)
  useEffect(() => {
    supabase
      .from("acm_followers")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setFollowerCount(count ?? 0));
  }, [subscribed]);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch {
      return false;
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (subscribed) return;

    setLoading(true);

    // Request push notification permission automatically
    const notifGranted = await requestNotificationPermission();

    const { error } = await supabase.from("acm_followers").insert({
      user_id: user.id,
      email: user.email,
      display_name: profile?.display_name || user.email?.split("@")[0],
      notifications_enabled: notifGranted,
    });

    setLoading(false);

    if (!error) {
      setSubscribed(true);
      setNotificationsEnabled(notifGranted);
      // Show a welcome notification if granted
      if (notifGranted && typeof Notification !== "undefined") {
        new Notification("Subscribed to APM Chibondo", {
          body: "You'll receive notifications for new articles and updates.",
          icon: "/favicon.ico",
        });
      }
    }
  };

  const handleUnsubscribe = async () => {
    if (!user || !subscribed) return;
    setLoading(true);
    const { error } = await supabase
      .from("acm_followers")
      .delete()
      .eq("user_id", user.id);
    setLoading(false);
    if (!error) {
      setSubscribed(false);
      setNotificationsEnabled(false);
    }
  };

  const toggleNotifications = async () => {
    if (!user || !subscribed) return;
    setLoading(true);

    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await supabase
          .from("acm_followers")
          .update({ notifications_enabled: true })
          .eq("user_id", user.id);
        setNotificationsEnabled(true);
      }
    } else {
      await supabase
        .from("acm_followers")
        .update({ notifications_enabled: false })
        .eq("user_id", user.id);
      setNotificationsEnabled(false);
    }
    setLoading(false);
  };

  const baseClasses = {
    nav: "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all",
    hero: "flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold transition-all",
    compact: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
  };

  if (subscribed) {
    return (
      <button
        onClick={toggleNotifications}
        disabled={loading}
        className={`${baseClasses[variant]} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700`}
        title={notificationsEnabled ? "Notifications on — click to disable" : "Click to enable notifications"}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : notificationsEnabled ? (
          <BellRing size={14} className="text-gray-900 dark:text-white" />
        ) : (
          <Bell size={14} />
        )}
        <span>Subscribed</span>
        {followerCount !== null && variant !== "compact" && (
          <span className="ml-1 text-gray-400">· {followerCount}</span>
        )}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`${baseClasses[variant]} bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 border border-900 dark:border-white disabled:opacity-60`}
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
