"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  archived: "bg-gray-100 text-gray-500 dark:bg-gray-800",
};

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    setArticles(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = articles;
    if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter);
    if (search) result = result.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.category?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, statusFilter, articles]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from("articles").delete().eq("id", id);
    load();
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("articles").update({ is_featured: !current }).eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Articles</h1>
          <p className="text-sm text-gray-500 mt-1">{articles.length} total</p>
        </div>
        <Link href="/admin/articles/new" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        {["all", "published", "draft", "archived"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${statusFilter === s ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-green-500"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileIcon />
            <p className="mt-3">No articles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {["Title", "Category", "Status", "Views", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        {a.is_featured && <Star size={13} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                        <span className="font-medium text-gray-900 dark:text-white truncate">{a.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{a.category}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Eye size={13} />{a.views || 0}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap text-xs">
                      {a.published_at ? formatDistanceToNow(new Date(a.published_at), { addSuffix: true }) : formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleFeatured(a.id, a.is_featured)} title="Toggle featured" className={`p-1.5 rounded-lg transition-colors ${a.is_featured ? "text-amber-500 hover:bg-amber-50" : "text-gray-300 hover:text-amber-400 hover:bg-amber-50"}`}>
                          <Star size={15} />
                        </button>
                        <Link href={`/admin/articles/${a.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                          <Edit size={15} />
                        </Link>
                        <button onClick={() => handleDelete(a.id, a.title)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FileIcon() {
  return <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
