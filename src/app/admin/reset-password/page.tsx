"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (type === "recovery" && accessToken) {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken || "" })
          .then(({ error }) => {
            if (error) setError("Invalid or expired reset link. Please request a new one.");
            else setReady(true);
          });
      } else {
        setError("Invalid reset link. Please request a new one.");
      }
    } else {
      setError("No reset token found. Please request a new password reset.");
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else {
      setSuccess(true);
      setTimeout(() => router.replace("/admin"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
            Arthur <span className="text-amber-600">Chibondo</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin Dashboard</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          {success ? (
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Password updated!</h2>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          ) : error && !ready ? (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-3 py-2.5 rounded-xl">
                {error}
              </div>
              <a href="/admin/forgot-password" className="block text-center text-sm text-amber-600 hover:underline">
                Request a new reset link
              </a>
            </div>
          ) : ready ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Set new password</h2>
              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-3 py-2.5 rounded-xl">
                  {error}
                </div>
              )}
              <form onSubmit={handleReset} className="space-y-4">
                <input
                  type="password"
                  required
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm"
                />
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? "Updating..." : "Set New Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Brandfletch Dev Studio © 2026</p>
      </div>
    </div>
  );
}
