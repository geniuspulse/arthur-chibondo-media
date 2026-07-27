"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
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
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Check your inbox</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reset link sent to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
              </p>
              <Link href="/admin/login" className="block text-sm text-amber-600 hover:underline mt-2">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Forgot password</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm"
                />
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-3 py-2.5 rounded-xl">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <div className="text-center mt-5">
                <Link href="/admin/login" className="text-sm text-gray-400 hover:text-amber-600 transition-colors">
                  ← Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Brandfletch Dev Studio © 2026</p>
      </div>
    </div>
  );
}
