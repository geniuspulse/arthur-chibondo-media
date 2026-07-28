import { supabase } from "@/lib/supabase";
import ProjectCard from "@/components/ProjectCard";

export const revalidate = 60;
export const metadata = { title: "Projects | Arthur Chibondo" };

export default async function ProjectsPage() {
  const { data: projects } = await supabase.from("projects").select("*").order("display_order");
  return (
    <main className="min-h-screen">
      <section className="py-20 px-6 text-center bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <span className="text-gray-400 uppercase tracking-widest text-sm font-semibold mb-4 block">Portfolio</span>
        <h1 className="text-4xl sm:text-6xl font-bold font-serif text-gray-900 dark:text-white mb-4">My Projects</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Businesses and initiatives I'm building to create opportunity in Malawi and Africa.</p>
      </section>
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects?.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </section>
    </main>
  );
}
