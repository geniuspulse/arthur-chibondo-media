"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, Eye, ArrowLeft, Loader } from "lucide-react";
import RichEditor from "./RichEditor";

const CATEGORIES = ["Entrepreneurship", "Technology & AI", "Education", "Business", "Malawi Development", "Personal Growth", "Politics & Society", "Media"];

interface Props {
  article?: any;
}

export default function ArticleEditor({ article }: Props) {
  const router = useRouter();
  const isEdit = !!article;

  const [form, setForm] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    cover_image: article?.cover_image || "",
    category: article?.category || "Entrepreneurship",
    reading_time: article?.reading_time || 5,
    status: article?.status || "draft",
    is_featured: article?.is_featured || false,
    tags: article?.tags?.join(", ") || "",
    youtube_video_id: article?.youtube_video_id || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const slugify = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (v: string) => {
    setForm(f => ({ ...f, title: v, slug: isEdit ? f.slug : slugify(v) }));
  };

  const handleSave = async (statusOverride?: string) => {
    setSaving(true);
    setError("");
    const payload: any = {
      ...form,
      slug: form.slug || slugify(form.title),
      reading_time: Number(form.reading_time),
      tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      status: statusOverride || form.status,
    };
    if (payload.status === "published" && !article?.published_at) {
      payload.published_at = new Date().toISOString();
    }
    delete payload.tags_str;

    let err;
    if (isEdit) {
      ({ error: err } = await supabase.from("articles").update(payload).eq("id", article.id));
    } else {
      ({ error: err } = await supabase.from("articles").insert(payload));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => { router.push("/admin/articles"); }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif text-gray-900 dark:text-white">{isEdit ? "Edit Article" : "New Article"}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{isEdit ? `Editing: ${article.title}` : "Create a new article"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {form.slug && (
            <a href={`/articles/${form.slug}`} target="_blank" className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:border-amber-500 transition-colors">
              <Eye size={14} /> Preview
            </a>
          )}
          {form.status === "draft" && (
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : null}
              Publish
            </button>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-300 text-white dark:text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Title</label>
              <input
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Article title"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-lg font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Slug</label>
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="url-slug"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm font-mono placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                placeholder="Short summary shown in article cards"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Content</label>
              <RichEditor value={form.content} onChange={(html) => setForm(f => ({ ...f, content: html }))} />
              <p className="text-xs text-gray-400 mt-1">{form.content.length} chars · ~{Math.ceil(form.content.split(/\s+/).length / 200)} min read</p>
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Settings</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Reading Time (mins)</label>
              <input type="number" min={1} value={form.reading_time} onChange={e => setForm(f => ({ ...f, reading_time: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                className="w-4 h-4 accent-amber-600 rounded" />
              <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">Featured article</label>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Media</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Cover Image URL</label>
              <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600" />
              {form.cover_image && <img src={form.cover_image} alt="" className="mt-3 w-full h-32 object-cover rounded-lg" onError={e => (e.currentTarget.style.display = "none")} />}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">YouTube Video ID (optional)</label>
              <input value={form.youtube_video_id} onChange={e => setForm(f => ({ ...f, youtube_video_id: e.target.value }))}
                placeholder="e.g. dQw4w9WgXcQ"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600" />
              <p className="text-xs text-gray-400 mt-1">Just the ID — e.g. <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">dQw4w9WgXcQ</code> from youtube.com/watch?v=dQw4w9WgXcQ</p>
              {form.youtube_video_id && (
                <div className="mt-3">
                  <img src={`https://img.youtube.com/vi/${form.youtube_video_id}/hqdefault.jpg`} alt="YouTube Video Thumbnail Preview" className="w-full h-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700" onError={e => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="entrepreneurship, malawi, tech"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
