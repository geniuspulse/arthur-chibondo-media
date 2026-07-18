"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";

const TYPE_LABELS: Record<string, string> = { interview: "Interview", podcast: "Podcast", video: "Video", article: "Article", press: "Press" };
const TYPE_COLORS: Record<string, string> = {
  interview: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  podcast: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  video: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  article: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  press: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function AdminMedia() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("media_appearances").select("*").order("appeared_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media appearance?")) return;
    await supabase.from("media_appearances").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Media Appearances</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} appearances</p>
        </div>
        <Link href="/admin/media/new" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Add Appearance
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 py-24 text-center">
          <p className="text-4xl mb-4">📡</p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No media appearances yet</p>
          <Link href="/admin/media/new" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={16} /> Add your first appearance
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>{["Title", "Type", "Source", "Date", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white max-w-xs">
                      <span className="truncate block">{item.title}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${TYPE_COLORS[item.type] || "bg-gray-100 text-gray-500"}`}>{TYPE_LABELS[item.type] || item.type}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{item.source}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{item.appeared_at ? format(new Date(item.appeared_at), "MMM d, yyyy") : "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {item.url && <a href={item.url} target="_blank" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"><ExternalLink size={14} /></a>}
                        <Link href={`/admin/media/${item.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><Edit size={14} /></Link>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
