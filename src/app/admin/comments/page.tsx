"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageCircle, Check, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  article_slug: string;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export default function CommentsAdmin() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("article_comments").select("*").order("created_at", { ascending: false });
    if (filter === "pending") q = q.eq("is_approved", false);
    if (filter === "approved") q = q.eq("is_approved", true);
    const { data } = await q;
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const approve = async (id: string) => {
    await supabase.from("article_comments").update({ is_approved: true }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await supabase.from("article_comments").delete().eq("id", id);
    load();
  };

  const pending = comments.filter(c => !c.is_approved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={22} className="text-amber-600" /> Comments
          </h1>
          {pending > 0 && <p className="text-sm text-amber-600 font-medium mt-0.5">{pending} pending review</p>}
        </div>
      </div>

      <div className="flex gap-2">
        {(["pending", "approved", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? "bg-amber-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No {filter !== "all" ? filter : ""} comments found.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {comments.map(c => (
              <div key={c.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{c.author_name}</span>
                      {c.author_email && <span className="text-xs text-gray-400">{c.author_email}</span>}
                      {!c.is_approved && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Clock size={10} />Pending</span>}
                    </div>
                    <p className="text-xs text-amber-600 mb-2">On: <a href={`/articles/${c.article_slug}`} className="hover:underline">{c.article_slug}</a></p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {!c.is_approved && (
                      <button onClick={() => approve(c.id)} title="Approve"
                        className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors">
                        <Check size={15} />
                      </button>
                    )}
                    <button onClick={() => remove(c.id)} title="Delete"
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
