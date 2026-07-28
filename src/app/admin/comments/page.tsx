"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  MessageCircle, Check, Trash2, Eye, EyeOff,
  RefreshCw, Search, ChevronDown
} from "lucide-react";
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
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    let q = supabase.from("article_comments").select("*").order("created_at", { ascending: false });
    if (filter === "visible") q = q.eq("is_approved", true);
    if (filter === "hidden") q = q.eq("is_approved", false);
    const { data } = await q;
    setComments(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = comments.filter(c =>
    !search ||
    c.author_name.toLowerCase().includes(search.toLowerCase()) ||
    c.content.toLowerCase().includes(search.toLowerCase()) ||
    c.article_slug.toLowerCase().includes(search.toLowerCase())
  );

  const toggleVisibility = async (c: Comment) => {
    setActionLoading(c.id);
    await supabase.from("article_comments").update({ is_approved: !c.is_approved }).eq("id", c.id);
    setActionLoading(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this comment permanently?")) return;
    setActionLoading(id);
    await supabase.from("article_comments").delete().eq("id", id);
    setActionLoading(null);
    load();
  };

  const bulkDelete = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} comment(s)?`)) return;
    await supabase.from("article_comments").delete().in("id", Array.from(selected));
    load();
  };

  const bulkHide = async () => {
    if (!selected.size) return;
    await supabase.from("article_comments").update({ is_approved: false }).in("id", Array.from(selected));
    load();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(c => c.id)));
    }
  };

  const visibleCount = comments.filter(c => c.is_approved).length;
  const hiddenCount = comments.filter(c => !c.is_approved).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={22} className="text-amber-600" />
            Comments
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400">{comments.length} total</span>
            <span className="text-xs text-emerald-600 font-medium">{visibleCount} visible</span>
            {hiddenCount > 0 && <span className="text-xs text-amber-600 font-medium">{hiddenCount} hidden</span>}
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filter + Search bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1.5">
          {(["all", "visible", "hidden"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${filter === f ? "bg-amber-600 text-white shadow-sm" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400"}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search comments…"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 mr-1">{selected.size} selected</span>
          <button onClick={bulkHide}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-amber-400 transition-colors">
            <EyeOff size={12} /> Hide
          </button>
          <button onClick={bulkDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            Clear
          </button>
        </div>
      )}

      {/* Comment list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-sm">
            {search ? "No comments match your search." : `No ${filter !== "all" ? filter : ""} comments yet.`}
          </div>
        ) : (
          <>
            {/* Select all header */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <input type="checkbox"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 dark:border-gray-600 accent-amber-600 cursor-pointer" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{filtered.length} comment{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(c => (
                <div key={c.id} className={`flex gap-3 p-4 transition-colors ${selected.has(c.id) ? "bg-amber-50/50 dark:bg-amber-900/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/20"}`}>
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-0.5">
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                      className="rounded border-gray-300 dark:border-gray-600 accent-amber-600 cursor-pointer" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{c.author_name}</span>
                      {c.author_email && <span className="text-xs text-gray-400">{c.author_email}</span>}
                      {!c.is_approved && (
                        <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                          HIDDEN
                        </span>
                      )}
                    </div>
                    <a href={`/articles/${c.article_slug}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-amber-600 hover:underline block mb-1.5 truncate">
                      /{c.article_slug}
                    </a>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-1">
                    <button onClick={() => toggleVisibility(c)} disabled={actionLoading === c.id}
                      title={c.is_approved ? "Hide comment" : "Show comment"}
                      className={`p-1.5 rounded-lg transition-colors ${c.is_approved ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                      {actionLoading === c.id
                        ? <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                        : c.is_approved ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => remove(c.id)} disabled={actionLoading === c.id}
                      title="Delete permanently"
                      className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
