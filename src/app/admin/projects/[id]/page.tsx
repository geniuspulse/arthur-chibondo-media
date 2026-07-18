"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProjectEditor from "@/components/admin/ProjectEditor";

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("projects").select("*").eq("id", params.id).single().then(({ data }) => { setProject(data); setLoading(false); });
  }, [params.id]);
  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <p className="text-center py-16 text-gray-400">Project not found.</p>;
  return <ProjectEditor project={project} />;
}
