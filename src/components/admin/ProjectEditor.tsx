"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Loader } from "lucide-react";

const STATUSES = ["active", "in_development", "completed", "coming_soon"];

interface Props { project?: any; }

export default function ProjectEditor({ project }: Props) {
  const router = useRouter();
  const isEdit = !!project;

  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const [form, setForm] = useState({
    name: project?.name || "",
    slug: project?.slug || "",
    tagline: project?.tagline || "",
    description: project?.description || "",
    cover_image: project?.cover_image || "",
    logo_image: project?.logo_image || "",
    problem: project?.problem || "",
    solution: project?.solution || "",
    tech_stack: project?.tech_stack || "",
    status: project?.status || "active",
    website_url: project?.website_url || "",
    is_featured: project?.is_featured || false,
    display_order: project?.display_order || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload = { ...form, slug: form.slug || slugify(form.name), display_order: Number(form.display_order) };
    let err;
    if (isEdit) {
      ({ error: err } = await supabase.from("projects").update(payload).eq("id", project.id));
    } else {
      ({ error: err } = await supabase.from("projects").insert(payload));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    router.push("/admin/projects");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold font-serif text-gray-900 dark:text-white">{isEdit ? "Edit Project" : "New Project"}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-colors">
          {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />} Save Project
        </button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-800 pb-3">Basic Info</h3>
            {[
              { label: "Project Name", key: "name", placeholder: "e.g. NyasaDesk" },
              { label: "Slug", key: "slug", placeholder: "url-slug", mono: true },
              { label: "Tagline", key: "tagline", placeholder: "One-line description" },
              { label: "Website URL", key: "website_url", placeholder: "https://..." },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{field.label}</label>
                <input
                  value={(form as any)[field.key]}
                  onChange={e => {
                    const v = e.target.value;
                    setForm(f => ({ ...f, [field.key]: v, ...(field.key === "name" && !isEdit ? { slug: slugify(v) } : {}) }));
                  }}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600 ${field.mono ? "font-mono" : ""}`}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Full description of the project" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-800 pb-3">Problem & Solution</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">The Problem</label>
              <textarea value={form.problem} onChange={e => setForm(f => ({ ...f, problem: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">The Solution</label>
              <textarea value={form.solution} onChange={e => setForm(f => ({ ...f, solution: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Tech Stack</label>
              <input value={form.tech_stack} onChange={e => setForm(f => ({ ...f, tech_stack: e.target.value }))} placeholder="Next.js, Supabase, Vercel..." className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Settings</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Display Order</label>
              <input type="number" min={0} value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="proj_featured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 accent-amber-600 rounded" />
              <label htmlFor="proj_featured" className="text-sm text-gray-700 dark:text-gray-300">Featured project</label>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Media</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Cover Image URL</label>
              <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600" />
              {form.cover_image && <img src={form.cover_image} alt="" className="mt-3 w-full h-28 object-cover rounded-lg" onError={e => (e.currentTarget.style.display = "none")} />}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Logo Image URL</label>
              <input value={form.logo_image} onChange={e => setForm(f => ({ ...f, logo_image: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
