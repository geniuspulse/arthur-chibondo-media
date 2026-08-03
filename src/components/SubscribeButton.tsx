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

  // Check if current user is subscribed (by email)
  useEffect(() => {
    if (!user?.email) {
      setSubscribed(false);
      return;
    }
    supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", user.email)
      .in("status", ["active", "active_notified"])
      .single()
      .then(({ data }) => {
        setSubscribed(!!data);
        setNotificationsEnabled(data?.status === "active_notified");
      });
  }, [user]);

  // Fetch subscriber count (public)
  useEffect(() => {
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "active_notified"])
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

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: user.email,
      name: profile?.display_name || user.email?.split("@")[0],
      status: notifGranted ? "active_notified" : "active",
    });

    setLoading(false);

    if (!error) {
      setSubscribed(true);
      setNotificationsEnabled(notifGranted);
      if (notifGranted && typeof Notification !== "undefined") {
        new Notification("Subscribed to APM Chibondo", {
          body: "You'll receive notifications for new articles and updates.",
          icon: "/favicon.ico",
        });
      }
    }
  };

  const handleUnsubscribe = async () => {
    if (!user?.email || !subscribed) return;
    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed" })
      .eq("email", user.email);
    setLoading(false);
    if (!error) {
      setSubscribed(false);
      setNotificationsEnabled(false);
    }
  };

  const toggleNotifications = async () => {
    if (!user?.email || !subscribed) return;
    setLoading(true);

    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await supabase
          .from("newsletter_subscribers")
          .update({ status: "active_notified" })
          .eq("email", user.email);
        setNotificationsEnabled(true);
      }
    } else {
      await supabase
        .from("newsletter_subscribers")
        .update({ status: "active" })
        .eq("email", user.email);
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
