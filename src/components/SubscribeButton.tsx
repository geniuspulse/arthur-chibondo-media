"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "./AuthModal";
import { Bell, Loader2, BellRing } from "lucide-react";

interface Props {
  variant?: "nav" | "hero" | "compact";
}

// Wraps a promise with a hard timeout so a stuck/unsupported permission
// prompt (common on some mobile browsers/webviews) can never hang the UI.
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then((val) => {
      clearTimeout(timer);
      resolve(val);
    }).catch(() => {
      clearTimeout(timer);
      resolve(fallback);
    });
  });
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
    if (!user?.email) {
      setSubscribed(false);
      return;
    }
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check", email: user.email }),
    })
      .then(r => r.json())
      .then(data => {
        setSubscribed(data.subscribed);
        // Load notification preference from localStorage
        setNotificationsEnabled(localStorage.getItem(`notif_${user.email}`) === "granted");
      })
      .catch(() => setSubscribed(false));
  }, [user]);

  // Fetch subscriber count (public read)
  useEffect(() => {
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .then(({ count }) => setFollowerCount(count ?? 0));
  }, [subscribed]);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === "undefined" || typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    try {
      // Some mobile browsers/webviews never resolve this promise if the
      // permission prompt can't actually be shown — race it against a
      // timeout so we never get stuck in a loading state.
      const permission = await withTimeout(Notification.requestPermission(), 4000, "default" as NotificationPermission);
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
    try {
      // Request push notification permission automatically (never hangs)
      const notifGranted = await requestNotificationPermission();

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          email: user.email,
          name: profile?.display_name || user.email?.split("@")[0],
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSubscribed(true);
        setNotificationsEnabled(notifGranted);
        if (user.email) {
          localStorage.setItem(`notif_${user.email}`, notifGranted ? "granted" : "denied");
        }
        if (notifGranted && typeof Notification !== "undefined") {
          try {
            new Notification("Subscribed to APM Chibondo", {
              body: "You'll receive notifications for new articles and updates.",
              icon: "/favicon.ico",
            });
          } catch {
            // Some browsers throw if not in a valid context — ignore, subscription still succeeded
          }
        }
      }
    } catch {
      // Network or unexpected error — button just resets so the user can retry
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    if (!user?.email || !subscribed) return;
    setLoading(true);
    try {
      if (!notificationsEnabled) {
        const granted = await requestNotificationPermission();
        if (granted) {
          localStorage.setItem(`notif_${user.email}`, "granted");
          setNotificationsEnabled(true);
        }
      } else {
        localStorage.setItem(`notif_${user.email}`, "denied");
        setNotificationsEnabled(false);
      }
    } catch {
      // ignore — button resets below regardless
    } finally {
      setLoading(false);
    }
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
