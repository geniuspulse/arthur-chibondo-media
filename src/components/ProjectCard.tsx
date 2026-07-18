"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cover_image?: string;
  status: string;
  website_url?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  in_development: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  coming_soon: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const statusLabel: Record<string, string> = {
  active: "Active",
  in_development: "In Development",
  completed: "Completed",
  coming_soon: "Coming Soon",
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all bg-white dark:bg-gray-900 flex flex-col">
      {project.cover_image ? (
        <div className="relative h-44 overflow-hidden">
          <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
          <span className="text-5xl font-bold font-serif text-gray-300 dark:text-gray-600">{project.name[0]}</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[project.status] || ""}`}>
            {statusLabel[project.status] || project.status}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{project.name}</h3>
        <p className="text-sm text-green-600 font-medium mb-3">{project.tagline}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">{project.description}</p>
        <div className="mt-4 flex gap-3">
          <Link href={`/projects/${project.slug}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">
            Learn more →
          </Link>
          {project.website_url && (
            <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-green-600 flex items-center gap-1 hover:text-green-500 transition-colors">
              Visit <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
