"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink, Star } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_development: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-gray-100 text-gray-500",
  coming_soon: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("projects").select("*").order("display_order");
    setProjects(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await supabase.from("projects").delete().eq("id", id);
    load();
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("projects").update({ is_featured: !current }).eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} projects</p>
        </div>
        <Link href="/admin/projects/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> New Project
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => (
            <div key={p.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
              {p.cover_image ? (
                <div className="h-36 overflow-hidden">
                  <img src={p.cover_image} alt={p.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  <span className="text-4xl font-bold font-serif text-gray-300 dark:text-gray-600">{p.name[0]}</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status]}`}>{p.status.replace("_", " ")}</span>
                  {p.is_featured && <Star size={13} className="text-amber-500 fill-amber-500" />}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{p.name}</h3>
                <p className="text-xs text-blue-600 mb-3">{p.tagline}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleFeatured(p.id, p.is_featured)} className={`p-1.5 rounded-lg transition-colors ${p.is_featured ? "text-amber-500 bg-amber-50" : "text-gray-300 hover:text-amber-400 hover:bg-amber-50"}`}>
                    <Star size={14} />
                  </button>
                  <Link href={`/admin/projects/${p.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Edit size={14} />
                  </Link>
                  {p.website_url && (
                    <a href={p.website_url} target="_blank" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="col-span-3 text-center text-gray-400 py-16">No projects yet</p>}
        </div>
      )}
    </div>
  );
}
