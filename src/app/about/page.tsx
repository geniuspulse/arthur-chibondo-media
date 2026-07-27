import { Metadata } from "next";

export const metadata: Metadata = { title: "About | Arthur Chibondo" };

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest block mb-4">About</span>
            <h1 className="text-4xl sm:text-6xl font-bold font-serif text-gray-900 dark:text-white mb-6">Arthur Chibondo</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">Entrepreneur. Digital Creator. Builder. Malawian.</p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <img src="https://media.base44.com/images/public/6a5b92f95ccce4d8e8c5bbe5/811a4bdd1_1768857984230.jpg" alt="Arthur Chibondo" className="w-72 h-80 object-cover rounded-2xl shadow-xl" />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">
        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-5">Biography</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>Arthur Chibondo is a Malawian entrepreneur, digital creator, and builder focused on creating technology solutions that solve real problems in education, marketing, and media across Malawi and Africa.</p>
            <p>Growing up in Malawi, Arthur witnessed firsthand the gap between the potential of young Africans and the tools and opportunities available to them. This drove him to dedicate his career to building platforms that close those gaps — one product at a time.</p>
            <p>He is the founder of The Chibondo Academy, an online learning platform helping Malawian students prepare for MSCE examinations; Brandfletch Media, a digital marketing company serving businesses across Malawi; and NyasaDesk, an AI-powered customer communication platform built for the African market.</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-5">Vision</h2>
          <blockquote className="border-l-4 border-amber-600 pl-6 py-2">
            <p className="text-xl text-gray-700 dark:text-gray-300 font-serif italic leading-relaxed">
              "I believe Malawi's best entrepreneurs, engineers, and creators have not been born yet. My job is to build the infrastructure — in knowledge, in tools, in confidence — that makes them possible."
            </p>
          </blockquote>
        </div>

        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-5">Philosophy</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>Arthur believes that building in Africa is not a limitation — it is a superpower. The problems are real, the market is enormous, and the window to build foundational companies is now.</p>
            <p>He writes and speaks openly about the realities of entrepreneurship in Malawi: the challenges of infrastructure, capital, and talent — and the extraordinary opportunity that comes with operating in a market that is still being defined.</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-5">Current Focus</h2>
          <ul className="space-y-3">
            {[
              "Building NyasaDesk into the leading customer communication platform for African businesses",
              "Expanding Chibondo Academy's curriculum and reach across Malawi",
              "Growing Brandfletch Media's client base and team",
              "Writing and sharing ideas about entrepreneurship, technology, and Africa",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-600 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
