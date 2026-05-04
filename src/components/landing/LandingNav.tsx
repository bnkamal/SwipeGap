"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "For schools", href: "#roles" },
  { label: "Pricing", href: "#pricing" },
];

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream border-b border-cream-border">
      <nav className="flex items-center justify-between px-7 h-[62px] max-w-[1200px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="SwipeGap — Swipe Your Gap. Ace Your Exam."
            width={140}
            height={44}
            className="h-[42px] w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-1.5 text-[13px] text-ink-mid rounded-lg hover:bg-cream-mid hover:text-teal transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-[13px] font-medium text-ink border border-cream-border rounded-[9px] hover:bg-cream-mid hover:border-teal-border transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-[13px] font-semibold text-white bg-teal rounded-[9px] hover:bg-teal-dark transition-colors"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-ink-mid"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {mobileOpen ? (
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <>
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-cream border-t border-cream-border px-7 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-[14px] text-ink-mid py-2"
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2 border-t border-cream-border mt-1">
            <Link
              href="/login"
              className="flex-1 text-center py-2 text-[13px] font-medium border border-cream-border rounded-[9px]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center py-2 text-[13px] font-semibold text-white bg-teal rounded-[9px]"
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
