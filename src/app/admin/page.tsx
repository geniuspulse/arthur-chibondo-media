"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FileText, Briefcase, Mail, MessageSquare, Eye, TrendingUp, Plus } from "lucide-react";

interface Stats {
  articles: number;
  published: number;
  drafts: number;
  projects: number;
  subscribers: number;
  messages: number;
  unread: number;
  views: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ articles: 0, published: 0, drafts: 0, projects: 0, subscribers: 0, messages: 0, unread: 0, views: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        { count: articles },
        { count: published },
        { count: drafts },
        { count: projects },
        { count: subscribers },
        { count: messages },
        { count: unread },
        { data: viewsData },
        { data: latestArticles },
        { data: latestMessages },
      ] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("articles").select("views"),
        supabase.from("articles").select("id,title,status,category,published_at,views").order("created_at", { ascending: false }).limit(5),
        supabase.from("contact_messages").select("id,name,email,inquiry_type,subject,status,created_at").order("created_at", { ascending: false }).limit(4),
      ]);

      const totalViews = (viewsData || []).reduce((sum: number, a: any) => sum + (a.views || 0), 0);
      setStats({ articles: articles || 0, published: published || 0, drafts: drafts || 0, projects: projects || 0, subscribers: subscribers || 0, messages: messages || 0, unread: unread || 0, views: totalViews });
      setRecentArticles(latestArticles || []);
      setRecentMessages(latestMessages || []);
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: "Total Articles", value: stats.articles, sub: `${stats.published} published · ${stats.drafts} drafts`, icon: <FileText size={20} />, href: "/admin/articles", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
    { label: "Projects", value: stats.projects, sub: "Active portfolio", icon: <Briefcase size={20} />, href: "/admin/projects", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
    { label: "Subscribers", value: stats.subscribers, sub: "Active newsletter subs", icon: <Mail size={20} />, href: "/admin/subscribers", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
    { label: "Messages", value: stats.messages, sub: `${stats.unread} unread`, icon: <MessageSquare size={20} />, href: "/admin/messages", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
    { label: "Total Views", value: stats.views.toLocaleString(), sub: "Across all articles", icon: <Eye size={20} />, href: "/admin/articles", color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, Arthur. Here's what's happening.</p>
        </div>
        <Link href="/admin/articles/new" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all hover:border-green-300 dark:hover:border-green-700">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{card.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Articles</h2>
            <Link href="/admin/articles" className="text-xs text-green-600 hover:text-green-500 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentArticles.map((a) => (
              <Link key={a.id} href={`/admin/articles/${a.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.category}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : a.status === "draft" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                    {a.status}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={11} />{a.views}</span>
                </div>
              </Link>
            ))}
            {recentArticles.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No articles yet</p>}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Messages</h2>
              {stats.unread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{stats.unread}</span>
              )}
            </div>
            <Link href="/admin/messages" className="text-xs text-green-600 hover:text-green-500 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentMessages.map((m) => (
              <Link key={m.id} href={`/admin/messages`} className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 flex-shrink-0 mt-0.5">
                  {m.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.name}</p>
                    {m.status === "new" && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 ml-2" />}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{m.subject || m.inquiry_type}</p>
                </div>
              </Link>
            ))}
            {recentMessages.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No messages yet</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/articles/new", label: "New Article", icon: <FileText size={18} />, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600" },
            { href: "/admin/projects/new", label: "New Project", icon: <Briefcase size={18} />, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600" },
            { href: "/admin/media/new", label: "Add Media", icon: <TrendingUp size={18} />, color: "bg-pink-50 dark:bg-pink-900/20 text-pink-600" },
            { href: "/", label: "View Site", icon: <Eye size={18} />, color: "bg-green-50 dark:bg-green-900/20 text-green-600", external: true },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${action.color} font-medium text-sm hover:opacity-80 transition-opacity`}
            >
              {action.icon} {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
