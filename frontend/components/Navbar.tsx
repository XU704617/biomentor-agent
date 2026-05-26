"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dna, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/explore", label: "知识探索" },
  { href: "/research", label: "科研实战" },
  { href: "/tools", label: "生物工具箱" },
  { href: "/cases", label: "产业案例" },
  { href: "/knowledge-map", label: "知识图谱" },
  { href: "/seminar", label: "学术研讨" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-[var(--nav-height)] glass-nav flex items-center justify-between px-6 md:px-10`}
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 group"
      >
        <span className="w-8 h-8 rounded-lg bg-[#0d0d1a] flex items-center justify-center group-hover:bg-[#1a1a2e] transition-colors">
          <Dna className="w-4 h-4 text-white" />
        </span>
        <span className="font-display text-[15px] font-extrabold tracking-tight text-[#0d0d1a]">
          BioMentor
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#0d0d1a] text-white"
                  : "text-[#4a4a6a] hover:text-[#0d0d1a] hover:bg-white/50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/assessment"
          className={`hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all ${
            pathname.startsWith("/assessment")
              ? "bg-[#2563eb] text-white"
              : "bg-[#0d0d1a] text-white hover:bg-[#1a1a2e] hover:shadow-lg hover:shadow-black/10"
          }`}
        >
          开始测评
        </Link>
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X className="w-5 h-5 text-[#0d0d1a]" />
          ) : (
            <Menu className="w-5 h-5 text-[#0d0d1a]" />
          )}
        </button>
      </div>

      {open && (
        <div className="absolute top-[var(--nav-height)] left-0 right-0 glass-nav border-t border-black/5 md:hidden">
          <div className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
                    isActive
                      ? "bg-[#0d0d1a] text-white"
                      : "text-[#4a4a6a] hover:bg-white/50"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/assessment"
              className="mt-2 px-4 py-3 rounded-xl text-[14px] font-semibold bg-[#2563eb] text-white text-center"
              onClick={() => setOpen(false)}
            >
              开始测评
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
