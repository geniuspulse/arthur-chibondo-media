"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function NewMediaPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", type: "interview", source: "", url: "", thumbnail: "", description: "", appeared_at: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    const { error: err } = await supabase.from("media_appearances").insert(form);
    setSaving(false);
    if (err) { setError(err.message); return; }
    router.push("/admin/media");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold font-serif text-gray-900 dark:text-white">Add Media Appearance</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-colors">
          <Save size={14} /> Save
        </button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        {[
          { label: "Title", key: "title", placeholder: "Interview on XYZ Podcast" },
          { label: "Source / Publication", key: "source", placeholder: "TechCabal, BBC, etc." },
          { label: "URL", key: "url", placeholder: "https://..." },
          { label: "Thumbnail URL", key: "thumbnail", placeholder: "https://..." },
        ].map(field => (
          <div key={field.key}>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{field.label}</label>
            <input value={(form as any)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} placeholder={field.placeholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Type</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600">
            {["interview", "podcast", "video", "article", "press"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Date</label>
          <input type="date" value={form.appeared_at} onChange={e => setForm(f => ({ ...f, appeared_at: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none" />
        </div>
      </div>
    </div>
  );
}
