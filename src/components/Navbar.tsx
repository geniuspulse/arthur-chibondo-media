"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import AuthModal from "./AuthModal";
import SubscribeButton from "./SubscribeButton";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/articles", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = (profile?.display_name || user?.email || "U")[0].toUpperCase();

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold font-serif text-xl text-gray-900 dark:text-white flex-shrink-0">
            APM Chibondo
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className={`text-sm font-medium transition-colors ${pathname === l.href ? "text-white font-semibold" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                {l.label}
              </Link>
            ))}

            {/* Subscribe button */}
            <SubscribeButton variant="compact" />

            {/* Auth area */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:border-gray-500 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-bold border border-gray-700 flex items-center justify-center">
                    {initial}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                    {profile?.display_name || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown size={13} className="text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{profile?.display_name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                <User size={14} /> Sign in
              </button>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <SubscribeButton variant="compact" />
            <button onClick={() => setOpen(!open)} className="text-gray-600 dark:text-gray-400 p-1">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {open && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`flex items-center min-h-[44px] py-3 px-4 text-sm font-medium rounded-lg transition-colors ${pathname === l.href ? "bg-gray-800 text-white font-semibold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50"}`}>
                {l.label}
              </Link>
            ))}
            {!user ? (
              <button onClick={() => { setShowAuth(true); setOpen(false); }}
                className="flex items-center gap-2 min-h-[44px] py-3 px-4 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <User size={14} /> Sign in / Create ACM Account
              </button>
            ) : (
              <button onClick={() => { signOut(); setOpen(false); }}
                className="flex items-center gap-2 min-h-[44px] py-3 px-4 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={14} /> Sign out
              </button>
            )}
          </div>
        )}

        {/* Mobile user menu */}
        {userMenuOpen && user && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{profile?.display_name}</p>
            <p className="text-xs text-gray-400 mb-3">{user.email}</p>
            <button onClick={() => { signOut(); setUserMenuOpen(false); }}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
