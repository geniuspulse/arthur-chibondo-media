"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Download, UserX, Bell, BellOff, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminSubscribers() {
  const [followers, setFollowers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });
    setFollowers(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(followers); return; }
    setFiltered(followers.filter(s =>
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.name?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, followers]);

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name || "this subscriber"}?`)) return;
    await supabase.from("newsletter_subscribers").delete().eq("id", id);
    load();
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Email", "Status", "Joined"],
      ...followers.map(s => [s.name || "", s.email || "", s.status || "active", s.subscribed_at]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apm-subscribers.csv";
    a.click();
  };

  const activeCount = followers.filter(s => s.status === "active" || s.status === "active_notified").length;
  const notifCount = followers.filter(s => s.status === "active_notified").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">{activeCount} total · {notifCount} with notifications on</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-1">Total Subscribers</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{notifCount}</p>
          <p className="text-xs text-gray-500 mt-1">Notifications Enabled</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeCount - notifCount}</p>
          <p className="text-xs text-gray-500 mt-1">Notifications Off</p>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {["Name", "Email", "Notifications", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
                          {(s.name || s.email || "?").charAt(0).toUpperCase()}
                        </div>
                        {s.name || <span className="text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{s.email || "—"}</td>
                    <td className="px-5 py-4">
                      {s.status === "active_notified" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900">
                          <Bell size={11} /> On
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                          <BellOff size={11} /> Off
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {s.subscribed_at ? formatDistanceToNow(new Date(s.subscribed_at), { addSuffix: true }) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleRemove(s.id, s.name || s.email)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove subscriber"
                      >
                        <UserX size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      {loading ? "Loading..." : "No subscribers yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
