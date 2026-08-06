import { supabase } from "@/lib/supabase";
import { ExternalLink } from "lucide-react";

export const revalidate = 60;
export const metadata = { title: "Media | Arthur Chibondo" };

export default async function MediaPage() {
  const { data: items } = await supabase.from("media_appearances").select("*").order("appeared_at", { ascending: false });
  return (
    <main className="min-h-screen">
      <section className="py-12 sm:py-20 px-4 sm:px-6 text-center bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <span className="text-gray-900 dark:text-white text-sm font-semibold uppercase tracking-widest mb-4 block">Press & Media</span>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-serif text-gray-900 dark:text-white mb-3 sm:mb-4">Media</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Interviews, podcasts, videos, and press coverage.</p>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {!items || items.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <p className="text-6xl mb-6">📡</p>
            <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-3">Coming Soon</h2>
            <p className="text-gray-500 dark:text-gray-400">Media appearances and press coverage will be listed here.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item: any) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                {item.thumbnail && <img src={item.thumbnail} alt={item.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />}
                <div className="p-5">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white block mb-2">{item.type}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-gray-900 dark:text-white transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">{item.source} <ExternalLink size={12} /></p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
