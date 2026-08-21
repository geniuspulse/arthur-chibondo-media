"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, Star, Copy, ExternalLink, Archive, RotateCcw, Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  archived: "bg-gray-100 text-gray-500 dark:bg-gray-800",
};

type SortField = "created_at" | "title" | "views" | "published_at";
type SortDir = "asc" | "desc";

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkBar, setShowBulkBar] = useState(false);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [toast, setToast] = useState<string>("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = async () => {
    const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    setArticles(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = [...articles];
    if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter);
    if (search) result = result.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.category?.toLowerCase().includes(search.toLowerCase()));
    result.sort((a, b) => {
      let av: any, bv: any;
      if (sortField === "title") { av = a.title?.toLowerCase() || ""; bv = b.title?.toLowerCase() || ""; }
      else if (sortField === "views") { av = a.views || 0; bv = b.views || 0; }
      else if (sortField === "published_at") { av = a.published_at || ""; bv = b.published_at || ""; }
      else { av = a.created_at || ""; bv = b.created_at || ""; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    setFiltered(result);
  }, [search, statusFilter, articles, sortField, sortDir]);

  const revalidate = async () => {
    try { await fetch('/api/revalidate', { method: 'POST' }); } catch {}
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch("/api/delete-article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      await revalidate();
      load();
      showToast(`Deleted "${title}"`);
    } else {
      showToast("Failed to delete article");
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("articles").update({ is_featured: !current }).eq("id", id);
    load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "published") {
      const article = articles.find(a => a.id === id);
      if (!article?.published_at) updates.published_at = new Date().toISOString();
    }
    await supabase.from("articles").update(updates).eq("id", id);
    await revalidate();
    load();
    showToast(`Article ${status}`);
  };

  const handleDuplicate = async (id: string) => {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    const copy: any = {
      title: `${article.title} (Copy)`,
      slug: `${article.slug}-copy`,
      excerpt: article.excerpt || "",
      content: article.content || "",
      cover_image: article.cover_image || "",
      category: article.category || "Entrepreneurship",
      reading_time: article.reading_time || 5,
      status: "draft",
      is_featured: false,
      tags: article.tags || [],
      youtube_video_id: article.youtube_video_id || "",
    };
    const { error } = await supabase.from("articles").insert(copy);
    if (!error) {
      load();
      showToast(`Duplicated "${article.title}" as draft`);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
    setShowBulkBar(next.size > 0);
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
      setShowBulkBar(false);
    } else {
      setSelected(new Set(filtered.map(a => a.id)));
      setShowBulkBar(true);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    const count = ids.length;

    if (action === "delete") {
      if (!confirm(`Delete ${count} article${count > 1 ? "s" : ""}? This cannot be undone.`)) return;
      const res = await fetch("/api/bulk-delete-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        showToast(`Deleted ${count} article${count > 1 ? "s" : ""}`);
      } else {
        showToast("Failed to delete articles");
      }
    } else if (action === "publish") {
      const now = new Date().toISOString();
      for (const id of ids) {
        const article = articles.find(a => a.id === id);
        const updates: any = { status: "published" };
        if (!article?.published_at) updates.published_at = now;
        await supabase.from("articles").update(updates).eq("id", id);
      }
      showToast(`Published ${count} article${count > 1 ? "s" : ""}`);
    } else if (action === "archive") {
      for (const id of ids) {
        await supabase.from("articles").update({ status: "archived" }).eq("id", id);
      }
      showToast(`Archived ${count} article${count > 1 ? "s" : ""}`);
    } else if (action === "unpublish") {
      for (const id of ids) {
        await supabase.from("articles").update({ status: "draft" }).eq("id", id);
      }
      showToast(`Moved ${count} article${count > 1 ? "s" : ""} to draft`);
    }

    await revalidate();
    setSelected(new Set());
    setShowBulkBar(false);
    load();
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white">Articles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{articles.length} total {selected.size > 0 && `\u00B7 ${selected.size} selected`}</p>
        </div>
        <Link href="/admin/articles/new" className="flex-shrink-0 inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-colors">
          <Plus size={15} /> <span className="hidden sm:inline">New Article</span><span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 dark:bg-gray-800 text-white text-sm px-4 py-3 rounded-xl shadow-lg border border-gray-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {["all", "published", "draft", "archived"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all capitalize ${statusFilter === s ? "bg-amber-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-amber-500"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {showBulkBar && (
        <div className="sticky top-0 z-40 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            {selected.size} selected
          </span>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <button onClick={() => handleBulkAction("publish")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors">
              <Send size={13} /> Publish
            </button>
            <button onClick={() => handleBulkAction("unpublish")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 font-medium rounded-lg transition-colors">
              <RotateCcw size={13} /> Unpublish
            </button>
            <button onClick={() => handleBulkAction("archive")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 font-medium rounded-lg transition-colors">
              <Archive size={13} /> Archive
            </button>
            <button onClick={() => handleBulkAction("delete")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={() => { setSelected(new Set()); setShowBulkBar(false); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileIcon />
            <p className="mt-3">No articles found</p>
          </div>
        ) : (
          <>
            {/* Mobile card layout */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(a => (
                <div key={a.id} className={`p-4 space-y-2 ${selected.has(a.id) ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)}
                        className="w-4 h-4 accent-amber-600 rounded flex-shrink-0" />
                      {a.is_featured && <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                      <span className="font-medium text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">{a.title}</span>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                  </div>
                  <div className="flex items-center justify-between pl-6">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{a.category}</span>
                      <span className="flex items-center gap-0.5"><Eye size={11} />{a.views || 0}</span>
                      <span>{a.published_at ? formatDistanceToNow(new Date(a.published_at), { addSuffix: true }) : formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {a.status === "published" && (
                        <a href={`/articles/${a.slug}`} target="_blank" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500" title="View live"><ExternalLink size={14} /></a>
                      )}
                      <Link href={`/admin/articles/${a.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600" title="Edit"><Edit size={14} /></Link>
                      <button onClick={() => handleDuplicate(a.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500" title="Duplicate"><Copy size={14} /></button>
                      {a.status !== "published" && (
                        <button onClick={() => handleStatusChange(a.id, "published")} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500" title="Publish"><Send size={14} /></button>
                      )}
                      {a.status === "published" && (
                        <button onClick={() => handleStatusChange(a.id, "draft")} className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-500" title="Unpublish"><RotateCcw size={14} /></button>
                      )}
                      {a.status !== "archived" && (
                        <button onClick={() => handleStatusChange(a.id, "archived")} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600" title="Archive"><Archive size={14} /></button>
                      )}
                      <button onClick={() => handleDelete(a.id, a.title)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll}
                        className="w-4 h-4 accent-amber-600 rounded" />
                    </th>
                    <th className="px-2 py-3 w-8"></th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button onClick={() => toggleSort("title")} className="flex items-center gap-1 hover:text-amber-600">Title <SortIcon active={sortField === "title"} dir={sortDir} /></button>
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button onClick={() => toggleSort("views")} className="flex items-center gap-1 hover:text-amber-600">Views <SortIcon active={sortField === "views"} dir={sortDir} /></button>
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button onClick={() => toggleSort("published_at")} className="flex items-center gap-1 hover:text-amber-600">Date <SortIcon active={sortField === "published_at"} dir={sortDir} /></button>
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(a => (
                    <tr key={a.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selected.has(a.id) ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)}
                          className="w-4 h-4 accent-amber-600 rounded" />
                      </td>
                      <td className="px-2 py-4">
                        <button onClick={() => handleToggleFeatured(a.id, a.is_featured)} title="Toggle featured"
                          className={`p-1 rounded transition-colors ${a.is_featured ? "text-amber-500" : "text-gray-300 hover:text-amber-400"}`}>
                          <Star size={14} fill={a.is_featured ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="px-3 py-4 max-w-xs">
                        <span className="font-medium text-gray-900 dark:text-white truncate block">{a.title}</span>
                        {a.excerpt && <span className="text-xs text-gray-400 truncate block mt-0.5">{a.excerpt}</span>}
                      </td>
                      <td className="px-3 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{a.category}</td>
                      <td className="px-3 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                      </td>
                      <td className="px-3 py-4 text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Eye size={13} />{a.views || 0}</span>
                      </td>
                      <td className="px-3 py-4 text-gray-400 whitespace-nowrap text-xs">
                        {a.published_at ? formatDistanceToNow(new Date(a.published_at), { addSuffix: true }) : formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {a.status === "published" && (
                            <a href={`/articles/${a.slug}`} target="_blank" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="View live">
                              <ExternalLink size={15} />
                            </a>
                          )}
                          <Link href={`/admin/articles/${a.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit">
                            <Edit size={15} />
                          </Link>
                          <button onClick={() => handleDuplicate(a.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Duplicate">
                            <Copy size={15} />
                          </button>
                          {a.status !== "published" ? (
                            <button onClick={() => handleStatusChange(a.id, "published")} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" title="Publish">
                              <Send size={15} />
                            </button>
                          ) : (
                            <button onClick={() => handleStatusChange(a.id, "draft")} className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors" title="Unpublish">
                              <RotateCcw size={15} />
                            </button>
                          )}
                          {a.status !== "archived" && (
                            <button onClick={() => handleStatusChange(a.id, "archived")} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Archive">
                              <Archive size={15} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(a.id, a.title)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-gray-300">&#8645;</span>;
  return <span className="text-amber-600">{dir === "asc" ? "\u2191" : "\u2193"}</span>;
}

function FileIcon() {
  return <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
