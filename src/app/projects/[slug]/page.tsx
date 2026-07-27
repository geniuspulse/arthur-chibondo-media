import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const revalidate = 60;

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const { data: project } = await supabase.from("projects").select("*").eq("slug", params.slug).single();
  if (!project) notFound();

  const statusLabel: Record<string, string> = { active: "Active", in_development: "In Development", completed: "Completed", coming_soon: "Coming Soon" };
  const statusStyles: Record<string, string> = {
    active: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    in_development: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    completed: "bg-gray-100 text-gray-600",
    coming_soon: "bg-amber-100 text-amber-700",
  };

  return (
    <main>
      <div className="relative w-full h-72 sm:h-96 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {project.cover_image && <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-6 pb-10 w-full">
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${statusStyles[project.status]}`}>{statusLabel[project.status]}</span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white font-serif">{project.name}</h1>
            <p className="text-lg text-gray-200 mt-2">{project.tagline}</p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-amber-600 mb-10"><ArrowLeft size={16} /> Back to Projects</Link>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10">{project.description}</p>
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
            <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">The Problem</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{project.problem}</p>
          </div>
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-blue-950/20 border border-amber-100 dark:border-amber-900/30">
            <h3 className="font-bold text-amber-700 dark:text-amber-400 mb-2">The Solution</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{project.solution}</p>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mb-8">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Tech Stack</p>
          <p className="text-gray-800 dark:text-gray-200">{project.tech_stack}</p>
        </div>
        {project.website_url && (
          <a href={project.website_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors">
            Visit Website <ExternalLink size={16} />
          </a>
        )}
      </div>
    </main>
  );
}
