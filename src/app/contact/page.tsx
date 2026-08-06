"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Twitter, Linkedin, Instagram, Youtube, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", inquiry_type: "general", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error: err } = await supabase.from("contact_messages").insert(form);
    setLoading(false);
    if (err) setError("Something went wrong. Please try again.");
    else setSuccess(true);
  };

  return (
    <main className="min-h-screen">
      <section className="py-12 sm:py-20 px-4 sm:px-6 text-center bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <span className="text-gray-900 dark:text-white text-sm font-semibold uppercase tracking-widest mb-4 block">Get In Touch</span>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-serif text-gray-900 dark:text-white mb-3 sm:mb-4">Contact</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Whether it's a business opportunity, media inquiry, or just a hello — I'd love to hear from you.</p>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid lg:grid-cols-2 gap-8 sm:gap-16">
        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-6">Business Inquiries</h2>
          <a href="mailto:arthur@chibondo.com" className="flex items-center gap-3 text-gray-900 dark:text-white mb-8">
            <Mail size={18} /> arthur@chibondo.com
          </a>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Open to</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
            {["Speaking engagements", "Media & podcast interviews", "Business partnerships", "Advisory roles", "Sponsorships"].map(i => (
              <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white" />{i}</li>
            ))}
          </ul>
          <div className="flex gap-3">
            {[{icon: <Twitter size={16} />, label: "Twitter"}, {icon: <Linkedin size={16} />, label: "LinkedIn"}, {icon: <Instagram size={16} />, label: "Instagram"}, {icon: <Youtube size={16} />, label: "YouTube"}].map(s => (
              <a key={s.label} href="#" aria-label={s.label} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{s.icon}</a>
            ))}
          </div>
        </div>
        <div>
          {success ? (
            <div className="flex flex-col items-center gap-4 py-12 text-gray-900 dark:text-white">
              <CheckCircle size={48} />
              <p className="text-xl font-semibold font-serif">Message sent!</p>
              <p className="text-gray-500 dark:text-gray-400 text-center">Thanks for reaching out. I'll get back to you within 48 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-sm" />
              <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email address" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-sm" />
              <select value={form.inquiry_type} onChange={e => setForm({...form, inquiry_type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-sm">
                <option value="general">General</option>
                <option value="business">Business</option>
                <option value="media">Media / Interview</option>
                <option value="speaking">Speaking</option>
                <option value="collaboration">Collaboration</option>
              </select>
              <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Subject" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-sm" />
              <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Your message" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-sm resize-none" />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
