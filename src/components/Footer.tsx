import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/articles", label: "Blog" },
  { href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
];

const explore = [
  { href: "https://brandfledger.com", label: "Brandfledger" },
  { href: "https://edu.brandfletch.com", label: "Brandfletch Academy" },
  { href: "https://ads.brandfletch.com", label: "Brandfletch Ads" },
  { href: "https://chibondoacademy.com", label: "Chibondo Academy" },
  { href: "https://nyasadesk.com", label: "Nyasadesk" },
];

const socials = [
  {
    label: "X / Twitter",
    href: "https://twitter.com/apmchibondo",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/apmchibondo",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/apmchibondo",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@apmchibondo",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-bold font-serif text-xl text-white mb-2">APM Chibondo</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Medical student. Entrepreneur. Digital content creator.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Navigation</p>
            <div className="flex flex-col gap-2.5">
              {links.map((l) => (
                <Link key={l.href} href={l.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Explore</p>
            <div className="flex flex-col gap-2.5">
              {explore.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Follow */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Follow</p>
            <div className="flex gap-3 flex-wrap">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} APM Chibondo. All rights reserved.
          </p>
          <p className="text-xs text-gray-700">
            An Arthur Chibondo Media product · Developed by{" "}
            <a
              href="https://dev.brandfletch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors underline underline-offset-2"
            >
              Brandfletch Dev Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
