"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageCircle, Send, Check, AlertCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    const { data } = await supabase
      .from("article_comments")
      .select("id, author_name, content, created_at")
      .eq("article_slug", slug)
      .eq("is_approved", true)
      .order("created_at", { ascending: true });
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => { loadComments(); }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);
    setError("");

    const { error: err } = await supabase.from("article_comments").insert([{
      article_slug: slug,
      author_name: name.trim(),
      author_email: email.trim() || null,
      content: content.trim(),
      is_approved: false,
    }]);

    setSubmitting(false);
    if (err) {
      setError("Failed to submit. Please try again.");
    } else {
      setSubmitted(true);
      setName(""); setEmail(""); setContent("");
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="flex items-center gap-2 text-xl font-bold font-serif text-gray-900 dark:text-white mb-6">
        <MessageCircle size={20} className="text-amber-600" />
        Comments {comments.length > 0 && <span className="text-sm font-normal text-gray-400">({comments.length})</span>}
      </h2>

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic mb-8">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <User size={15} className="text-amber-700 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.author_name}</span>
                    <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{c.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      {submitted ? (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <Check size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">Comment submitted!</p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">It will appear after moderation. Thank you for sharing your thoughts.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Leave a Comment</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Name *</label>
              <input
                required value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Email <span className="text-gray-400 font-normal">(optional, not published)</span></label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Comment *</label>
            <textarea
              required value={content} onChange={e => setContent(e.target.value)}
              rows={4} placeholder="Share your thoughts..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
            {submitting ? "Submitting..." : "Post Comment"}
          </button>
          <p className="text-xs text-gray-400">Comments are reviewed before publishing.</p>
        </form>
      )}
    </div>
  );
}
