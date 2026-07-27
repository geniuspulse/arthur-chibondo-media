import Link from "next/link";
import { Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/articles", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          <div>
            <p className="font-bold font-serif text-xl text-gray-900 dark:text-white mb-2">
              <span className="text-amber-600">APM</span> Chibondo
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Building, Learning, and Sharing Ideas from Malawi.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Navigation</p>
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-amber-600 transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Connect</p>
            <div className="flex gap-3">
              {[
                { icon: <Twitter size={16} />, href: "#", label: "Twitter" },
                { icon: <Linkedin size={16} />, href: "#", label: "LinkedIn" },
                { icon: <Instagram size={16} />, href: "#", label: "Instagram" },
                { icon: <Youtube size={16} />, href: "#", label: "YouTube" },
              ].map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Arthur Chibondo. All rights reserved. Built with ❤️ from Malawi.
          </p>
        </div>
      </div>
    </footer>
  );
}
