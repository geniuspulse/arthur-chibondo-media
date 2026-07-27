"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  FileText, 
  Briefcase, 
  Mail, 
  MessageSquare, 
  Eye, 
  Plus, 
  Megaphone, 
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Inbox
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Stats {
  articlesTotal: number;
  articlesPublished: number;
  articlesDraft: number;
  projectsCount: number;
  subscribersCount: number;
  messagesUnread: number;
  totalViews: number;
}

interface Article {
  id: string;
  title: string;
  category: string;
  status: string;
  views: number;
  created_at: string;
}

interface Message {
  id: string;
  name: string;
  subject: string;
  inquiry_type: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch articles for views calculation and published/draft stats
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("status, views");
      
      if (articlesError) throw articlesError;

      let totalViews = 0;
      let articlesPublished = 0;
      let articlesDraft = 0;
      const articlesTotal = articlesData?.length || 0;

      articlesData?.forEach((art) => {
        totalViews += art.views || 0;
        if (art.status === "published") {
          articlesPublished++;
        } else if (art.status === "draft") {
          articlesDraft++;
        }
      });

      // Fetch projects count
      const { count: projectsCount, error: projectsError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      if (projectsError) throw projectsError;

      // Fetch newsletter subscribers count (active only)
      const { count: subscribersCount, error: subscribersError } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (subscribersError) throw subscribersError;

      // Fetch unread contact messages count
      const { count: messagesUnread, error: messagesUnreadError } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");

      if (messagesUnreadError) throw messagesUnreadError;

      // Fetch last 5 articles
      const { data: latestArticles, error: latestArticlesError } = await supabase
        .from("articles")
        .select("id, title, category, status, views, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (latestArticlesError) throw latestArticlesError;

      // Fetch last 4 contact messages
      const { data: latestMessages, error: latestMessagesError } = await supabase
        .from("contact_messages")
        .select("id, name, subject, inquiry_type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(4);

      if (latestMessagesError) throw latestMessagesError;

      setStats({
        articlesTotal,
        articlesPublished,
        articlesDraft,
        projectsCount: projectsCount || 0,
        subscribersCount: subscribersCount || 0,
        messagesUnread: messagesUnread || 0,
        totalViews,
      });

      setRecentArticles((latestArticles as Article[]) || []);
      setRecentMessages((latestMessages as Message[]) || []);
    } catch (err: any) {
      console.error("Dashboard statistics loading failed:", err);
      setError(err.message || "Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Fetching dashboard stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center max-w-2xl mx-auto my-12">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-950 dark:text-white mb-2">Failed to Load Dashboard</h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-6">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Articles",
      value: stats?.articlesTotal || 0,
      sub: `${stats?.articlesPublished || 0} published · ${stats?.articlesDraft || 0} drafts`,
      icon: <FileText size={20} />,
      href: "/admin/articles",
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30",
    },
    {
      label: "Projects",
      value: stats?.projectsCount || 0,
      sub: "Active portfolio items",
      icon: <Briefcase size={20} />,
      href: "/admin/projects",
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/30",
    },
    {
      label: "Subscribers",
      value: stats?.subscribersCount || 0,
      sub: "Active newsletter subs",
      icon: <Mail size={20} />,
      href: "/admin/subscribers",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30",
    },
    {
      label: "Unread Messages",
      value: stats?.messagesUnread || 0,
      sub: "Require response",
      icon: <MessageSquare size={20} />,
      href: "/admin/messages",
      color: (stats?.messagesUnread || 0) > 0 
        ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 animate-pulse-slow"
        : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30",
    },
    {
      label: "Total Views",
      value: (stats?.totalViews || 0).toLocaleString(),
      sub: "Across all articles",
      icon: <Eye size={20} />,
      href: "/admin/articles",
      color: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 border-pink-100 dark:border-pink-900/30",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">APM ChibondoMedia</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, Arthur. Manage your articles, projects, ads, and newsletter subscribers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link 
            href="/admin/articles/new" 
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} /> New Article
          </Link>
          <Link 
            href="/admin/projects/new" 
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} /> New Project
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link 
            key={card.label} 
            href={card.href} 
            className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-850 p-5 hover:shadow-md transition-all duration-200 hover:border-amber-400 dark:hover:border-amber-800"
          >
            <div className={`w-10 h-10 rounded-xl border ${card.color} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-500">
              {card.value}
            </p>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{card.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-550 mt-0.5">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-amber-600" />
              Recent Articles
            </h2>
            <Link href="/admin/articles" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 flex-1 overflow-x-auto">
            {recentArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <FileText size={32} className="text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">No articles created yet</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">Write your first article to share entrepreneurship and tech insights.</p>
                <Link href="/admin/articles/new" className="mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                  Create article <Plus size={12} />
                </Link>
              </div>
            ) : (
              recentArticles.map((art) => (
                <div key={art.id} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-850/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {art.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{art.category}</span>
                      <span className="text-gray-300 dark:text-gray-700 text-xs">•</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-0.5"><Eye size={12} />{art.views || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      art.status === "published" 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" 
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}>
                      {art.status}
                    </span>
                    <Link 
                      href={`/admin/articles/${art.id}`} 
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-rose-500" />
              Recent Messages
            </h2>
            <Link href="/admin/messages" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 flex-1">
            {recentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <Inbox size={32} className="text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Inbox is currently empty</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">When users contact you through your portfolio site, their messages will appear here.</p>
              </div>
            ) : (
              recentMessages.map((msg) => (
                <Link key={msg.id} href="/admin/messages" className="block px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-850/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {msg.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{msg.name}</span>
                          {msg.status === "new" && (
                            <span className="inline-flex w-2 h-2 rounded-full bg-rose-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {msg.subject || msg.inquiry_type || "No Subject"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex-shrink-0">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { 
              href: "/admin/articles/new", 
              label: "New Article", 
              icon: <FileText size={18} />, 
              color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-900/30" 
            },
            { 
              href: "/admin/projects/new", 
              label: "New Project", 
              icon: <Briefcase size={18} />, 
              color: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-900/30" 
            },
            { 
              href: "/admin/ads", 
              label: "Manage Ads", 
              icon: <Megaphone size={18} />, 
              color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/30" 
            },
            { 
              href: "/admin/messages", 
              label: "View Messages", 
              icon: <MessageSquare size={18} />, 
              color: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/30" 
            },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${action.color}`}
            >
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
