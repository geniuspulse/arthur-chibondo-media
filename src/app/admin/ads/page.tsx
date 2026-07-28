"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Power,
  Eye,
  MousePointerClick,
  ExternalLink,
  Calendar,
  Layers,
  Code,
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";
import { format } from "date-fns";

interface Ad {
  id: string;
  name: string;
  placement: "header" | "sidebar" | "in-article" | "footer" | "popup";
  type: "image" | "script" | "html" | "link";
  content: string;
  destination_url?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  impressions: number;
  clicks: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function AdsManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Inline Panel state
  const [isOpen, setIsOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [placement, setPlacement] = useState<Ad["placement"]>("header");
  const [type, setType] = useState<Ad["type"]>("image");
  const [content, setContent] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch all ads
  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("ads")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setAds((data as Ad[]) || []);
    } catch (err: any) {
      console.error("Error loading advertisements:", err);
      setError(err.message || "Failed to load advertisements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Toggle active status in database
  const toggleActive = async (ad: Ad) => {
    const nextActive = !ad.is_active;
    try {
      // Optimistic update
      setAds((prev) =>
        prev.map((item) =>
          item.id === ad.id ? { ...item, is_active: nextActive } : item
        )
      );

      const { error: updateError } = await supabase
        .from("ads")
        .update({ is_active: nextActive, updated_at: new Date().toISOString() })
        .eq("id", ad.id);

      if (updateError) {
        // Revert on error
        setAds((prev) =>
          prev.map((item) =>
            item.id === ad.id ? { ...item, is_active: ad.is_active } : item
          )
        );
        throw updateError;
      }
    } catch (err: any) {
      console.error("Error toggling active status:", err);
      alert(err.message || "Failed to update status.");
    }
  };

  // Delete advertisement
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this advertisement? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("ads")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      fetchAds();
    } catch (err: any) {
      console.error("Error deleting advertisement:", err);
      alert(err.message || "Failed to delete advertisement.");
    }
  };

  // Open panel for creation
  const handleOpenNew = () => {
    setEditingAd(null);
    setName("");
    setPlacement("header");
    setType("image");
    setContent("");
    setDestinationUrl("");
    setStartDate("");
    setEndDate("");
    setNotes("");
    setIsActive(true);
    setIsOpen(true);
  };

  // Open panel for editing
  const handleOpenEdit = (ad: Ad) => {
    setEditingAd(ad);
    setName(ad.name);
    setPlacement(ad.placement);
    setType(ad.type);
    setContent(ad.content);
    setDestinationUrl(ad.destination_url || "");
    setStartDate(ad.start_date || "");
    setEndDate(ad.end_date || "");
    setNotes(ad.notes || "");
    setIsActive(ad.is_active);
    setIsOpen(true);
  };

  // Submit form (create or edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    if (!content.trim()) {
      alert("Content is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        placement,
        type,
        content: content.trim(),
        destination_url: destinationUrl.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        notes: notes.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (editingAd) {
        // Update
        const { error: updateError } = await supabase
          .from("ads")
          .update(payload)
          .eq("id", editingAd.id);

        if (updateError) throw updateError;
      } else {
        // Create
        const { error: createError } = await supabase
          .from("ads")
          .insert([{ ...payload, impressions: 0, clicks: 0 }]);

        if (createError) throw createError;
      }

      setIsOpen(false);
      fetchAds();
    } catch (err: any) {
      console.error("Error saving ad:", err);
      alert(err.message || "Failed to save advertisement.");
    } finally {
      setSaving(false);
    }
  };

  // Badges configuration
  const getPlacementBadge = (p: Ad["placement"]) => {
    switch (p) {
      case "header":
        return "bg-amber-50 text-amber-700 border-blue-200 dark:bg-blue-950/40 dark:text-amber-400 dark:border-amber-900/30";
      case "sidebar":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30";
      case "in-article":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30";
      case "footer":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
      case "popup":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getTypeIcon = (t: Ad["type"]) => {
    switch (t) {
      case "image":
        return <ImageIcon size={12} />;
      case "script":
        return <Code size={12} />;
      case "html":
        return <Layers size={12} />;
      case "link":
        return <LinkIcon size={12} />;
    }
  };

  const getTypeBadge = (t: Ad["type"]) => {
    switch (t) {
      case "image":
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30";
      case "script":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
      case "html":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30";
      case "link":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 pb-12 relative min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone size={24} className="text-amber-600" />
            Ads Manager
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure and track promotional banner slots and scripts across Arthur Chibondo Media.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm w-fit"
        >
          <Plus size={16} /> New Ad Banner
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading ads database...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center max-w-2xl mx-auto my-12">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-950 dark:text-white mb-2">Database Error</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-6">{error}</p>
          <button
            onClick={fetchAds}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            Reload Database
          </button>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-16 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Megaphone size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Ads Available</h3>
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-1 max-w-md">
            Promote sponsors, affiliate programs, or highlight your own newsletters and speaking events. Create your first ad unit.
          </p>
          <button
            onClick={handleOpenNew}
            className="mt-6 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} /> Create Ad Unit
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          {/* ── Mobile card list (< sm) ── */}
          <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {ads.map((ad) => (
              <div key={ad.id} className="p-4 space-y-3">
                {/* Top row: name + actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{ad.name}</p>
                    {ad.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{ad.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleOpenEdit(ad)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(ad.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => toggleActive(ad)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${ad.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50" : "bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700"}`}>
                    <Power size={10} className={ad.is_active ? "animate-pulse" : ""} />{ad.is_active ? "Active" : "Paused"}
                  </button>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${getPlacementBadge(ad.placement)}`}>{ad.placement}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${getTypeBadge(ad.type)}`}>{getTypeIcon(ad.type)}{ad.type}</span>
                </div>
                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Eye size={11} /><strong>{ad.impressions || 0}</strong> views</span>
                  <span className="flex items-center gap-1"><MousePointerClick size={11} /><strong>{ad.clicks || 0}</strong> clicks</span>
                  <span className="text-gray-400">{format(new Date(ad.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table (≥ sm) ── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ad Detail</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Placement</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button onClick={() => toggleActive(ad)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${ad.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50" : "bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700"}`}>
                        <Power size={10} className={ad.is_active ? "animate-pulse" : ""} />{ad.is_active ? "Active" : "Paused"}
                      </button>
                    </td>
                    <td className="px-5 py-3 max-w-[200px]">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{ad.name}</p>
                      {ad.notes && <p className="text-xs text-gray-400 truncate">{ad.notes}</p>}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${getPlacementBadge(ad.placement)}`}>{ad.placement}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${getTypeBadge(ad.type)}`}>{getTypeIcon(ad.type)}{ad.type}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                        <div className="flex items-center gap-1"><Eye size={11} /><strong>{ad.impressions || 0}</strong> views</div>
                        <div className="flex items-center gap-1"><MousePointerClick size={11} /><strong>{ad.clicks || 0}</strong> clicks</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenEdit(ad)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(ad.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Panel (Drawers on Desktop, Bottom Sheets on Mobile) */}
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50">
          <div className="w-full sm:max-w-lg bg-white dark:bg-gray-900 sm:rounded-2xl border-t sm:border border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <Megaphone size={18} className="text-amber-600" />
                {editingAd ? "Modify Ad Unit" : "Deploy New Ad Unit"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Ad Unit Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hostinger Sidebar Banner Jul 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm transition-all"
                />
              </div>

              {/* Placement & Type Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Placement Location *
                  </label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as Ad["placement"])}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm transition-all"
                  >
                    <option value="header">Header</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="in-article">In-Article</option>
                    <option value="footer">Footer</option>
                    <option value="popup">Popup</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Format Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Ad["type"])}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm transition-all"
                  >
                    <option value="image">Image Banner</option>
                    <option value="script">JS Script Tag</option>
                    <option value="html">Custom HTML</option>
                    <option value="link">Text Link / URL Only</option>
                  </select>
                </div>
              </div>

              {/* Content Content Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Banner Content *
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {type === "image" && "Enter Image URL"}
                    {type === "script" && "Enter Javascript script code"}
                    {type === "html" && "Paste raw HTML layout code"}
                    {type === "link" && "Paste tracking/affiliate link"}
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder={
                    type === "image"
                      ? "https://example.com/assets/banner_728x90.png"
                      : type === "link"
                      ? "https://example.com/ref?code=arthur"
                      : "<!-- Paste snippet here -->"
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm font-mono transition-all"
                />
              </div>

              {/* Destination URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                  Destination URL
                  <span className="text-[10px] text-gray-400 font-normal italic lowercase">(for image banners)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://affiliate-target.com/landing"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm transition-all"
                />
              </div>

              {/* Campaign Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" /> End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Internal Campaign Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Sponsorship point of contact: contact@sponsor.com, $150 CPC cap."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm transition-all"
                />
              </div>

              {/* Toggle switch for is_active */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Active on deploy</span>
                  <span className="text-xs text-gray-400">Instantly start showing this ad if in date range.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    isActive ? "bg-amber-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-750 text-gray-700 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-amber-400"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deploying...
                    </>
                  ) : editingAd ? (
                    "Save Changes"
                  ) : (
                    "Deploy Banner"
                  )}
                </button>
              </div>
            </form>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
