"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, Mail } from "lucide-react";

function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export default function HeaderNavClient({ categories, schoolName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
      {/* Top Utility Bar */}
      <div className="bg-zinc-900 text-zinc-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#fa9000]">البوابة الإخبارية</span>
            <span className="hidden sm:inline text-zinc-400">
              {new Intl.DateTimeFormat("ar-DZ", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date())}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="mailto:mulhaqetbatna0505@gmail.com"
              className="hidden sm:flex items-center gap-1.5 hover:text-[#fa9000] transition-colors"
              dir="ltr"
            >
              <Mail className="w-3.5 h-3.5 text-[#fa9000]" />
              <span>mulhaqetbatna0505@gmail.com</span>
            </a>
            <a
              href="https://web.facebook.com/pageonaeabatna"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#fa9000] transition-colors"
              aria-label="صفحة فيسبوك"
            >
              <FacebookIcon className="w-3.5 h-3.5 text-[#fa9000]" />
              <span className="hidden md:inline">فيسبوك</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 border border-zinc-300 text-zinc-800 hover:bg-zinc-100"
            aria-label="القائمة"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt={schoolName}
              className="w-11 h-11 object-contain shrink-0"
            />
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 leading-tight group-hover:text-[#d97706] transition-colors">
                {schoolName}
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">
                أخبار التعليم ومحو الأمية على مدار الساعة
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center border border-zinc-300 bg-zinc-50 focus-within:border-[#fa9000] w-72"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الأخبار..."
            className="w-full px-3 py-2 text-sm bg-transparent outline-none text-zinc-900 placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="px-3 py-2 text-zinc-600 hover:text-[#fa9000]"
            aria-label="بحث"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Mobile Search Toggle */}
        <button
          type="button"
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 border border-zinc-300 text-zinc-700"
          aria-label="بحث"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Search Box */}
      {searchOpen && (
        <div className="md:hidden border-t border-zinc-200 px-4 py-2 bg-zinc-50">
          <form onSubmit={handleSearch} className="flex items-center border border-zinc-300 bg-white">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في الأخبار..."
              className="w-full px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="px-3 py-2 bg-[#fa9000] text-white text-sm font-bold">
              بحث
            </button>
          </form>
        </div>
      )}

      {/* Desktop Category Navigation */}
      <nav className="hidden lg:block bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto">
            <li>
              <Link
                href="/"
                className={`block px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  pathname === "/"
                    ? "border-[#fa9000] text-[#d97706] bg-white"
                    : "border-transparent text-zinc-800 hover:text-[#d97706] hover:border-zinc-300"
                }`}
              >
                الرئيسية
              </Link>
            </li>
            {categories.map((cat) => {
              const href = `/category/${encodeURIComponent(cat.slug)}`;
              const isActive = pathname === href || decodeURIComponent(pathname) === `/category/${cat.slug}`;
              return (
                <li key={cat._id}>
                  <Link
                    href={href}
                    className={`block px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                      isActive
                        ? "border-[#fa9000] text-[#d97706] bg-white"
                        : "border-transparent text-zinc-800 hover:text-[#d97706] hover:border-zinc-300"
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-zinc-200 bg-white">
          <ul className="divide-y divide-zinc-100">
            <li>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-50"
              >
                الرئيسية
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  href={`/category/${encodeURIComponent(cat.slug)}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-zinc-50"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
