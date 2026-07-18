"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.from("newsletter_subscribers").insert({ email, name });
    setLoading(false);
    if (err) {
      if (err.code === "23505") setError("You're already subscribed!");
      else setError("Something went wrong. Please try again.");
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-blue-600">
        <CheckCircle size={40} />
        <p className="font-semibold text-lg">You're in! Welcome to the newsletter.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="text"
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="hidden"
      />
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
      >
        {loading ? "Subscribing..." : (<>Subscribe <ArrowRight size={14} /></>)}
      </button>
      {error && <p className="text-red-500 text-xs mt-1 w-full">{error}</p>}
    </form>
  );
}
