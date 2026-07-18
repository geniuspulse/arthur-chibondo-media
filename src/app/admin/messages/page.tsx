"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Mail, MailOpen, Trash2, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_LABELS: Record<string, string> = { general: "General", business: "Business", media: "Media", speaking: "Speaking", collaboration: "Collaboration" };
const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  read: "bg-gray-100 text-gray-500 dark:bg-gray-800",
  replied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages(data || []);
    setFiltered(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = messages;
    if (statusFilter !== "all") result = result.filter(m => m.status === statusFilter);
    if (search) result = result.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase()) || m.subject?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, statusFilter, messages]);

  const openMessage = async (msg: any) => {
    setSelected(msg);
    if (msg.status === "new") {
      await supabase.from("contact_messages").update({ status: "read" }).eq("id", msg.id);
      load();
    }
  };

  const markReplied = async (id: string) => {
    await supabase.from("contact_messages").update({ status: "replied" }).eq("id", id);
    load();
    setSelected((s: any) => s?.id === id ? { ...s, status: "replied" } : s);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    if (selected?.id === id) setSelected(null);
    load();
  };

  const unread = messages.filter(m => m.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Messages</h1>
          {unread > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} new</span>}
        </div>
        <p className="text-sm text-gray-500">{messages.length} total</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600" />
        </div>
        {["all", "new", "read", "replied"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${statusFilter === s ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-500"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-16 text-sm">No messages</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
              {filtered.map(m => (
                <button key={m.id} onClick={() => openMessage(m)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selected?.id === m.id ? "bg-blue-50 dark:bg-blue-900/10 border-l-2 border-l-blue-500" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {m.status === "new" ? <Mail size={13} className="text-blue-600 flex-shrink-0" /> : <MailOpen size={13} className="text-gray-400 flex-shrink-0" />}
                    <span className={`text-sm font-medium truncate ${m.status === "new" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>{m.name}</span>
                    <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLES[m.status]}`}>{m.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate pl-5">{m.subject || TYPE_LABELS[m.inquiry_type] || m.inquiry_type}</p>
                  <p className="text-xs text-gray-400 pl-5 mt-0.5">{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full py-24 text-gray-400">
              <Mail size={36} className="mb-3 opacity-50" />
              <p className="text-sm">Select a message to read</p>
            </div>
          ) : (
            <div className="p-6 space-y-5 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">{selected.subject || "No subject"}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selected.name} · <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">{selected.email}</a></p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">{TYPE_LABELS[selected.inquiry_type] || selected.inquiry_type}</span>
                    <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {selected.status !== "replied" && (
                    <button onClick={() => markReplied(selected.id)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Mark as replied">
                      <Reply size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "")}`}
                onClick={() => markReplied(selected.id)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-fit"
              >
                <Reply size={15} /> Reply via Email
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
