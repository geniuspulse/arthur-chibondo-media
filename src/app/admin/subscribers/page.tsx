"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Download, UserX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false });
    setSubscribers(data || []);
    setFiltered(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(subscribers); return; }
    setFiltered(subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase())));
  }, [search, subscribers]);

  const handleUnsubscribe = async (id: string, email: string) => {
    if (!confirm(`Unsubscribe ${email}?`)) return;
    await supabase.from("newsletter_subscribers").update({ status: "unsubscribed" }).eq("id", id);
    load();
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Status", "Subscribed At"], ...subscribers.map(s => [s.name || "", s.email, s.status, s.subscribed_at])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
  };

  const active = subscribers.filter(s => s.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">{active} active · {subscribers.length} total</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-500 hover:text-amber-600 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: subscribers.length },
          { label: "Active", value: active, highlight: true },
          { label: "Unsubscribed", value: subscribers.length - active },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <p className={`text-3xl font-bold ${s.highlight ? "text-amber-600" : "text-gray-900 dark:text-white"}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>{["Name", "Email", "Status", "Subscribed", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{s.name || <span className="text-gray-400">—</span>}</td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{s.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.status === "active" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>{s.status}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{formatDistanceToNow(new Date(s.subscribed_at), { addSuffix: true })}</td>
                    <td className="px-5 py-4">
                      {s.status === "active" && (
                        <button onClick={() => handleUnsubscribe(s.id, s.email)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <UserX size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-400">No subscribers found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
