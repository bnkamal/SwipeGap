"use client";

import { useState } from "react";
import Link from "next/link";
import { ROLES, RoleData, RoleKey } from "@/lib/roleData";

function UserIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="8" r="4" stroke={color} strokeWidth="1.5" />
      <path
        d="M3.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RolePanel({ role }: { role: RoleData }) {
  return (
    <div
      className="flex flex-col md:flex-row rounded-[20px] overflow-hidden border"
      style={{ borderColor: role.border }}
    >
      {/* Left — identity + tagline */}
      <div
        className="md:w-[220px] flex-shrink-0 p-7 flex flex-col justify-between"
        style={{ background: role.bg }}
      >
        <div>
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-3.5"
            style={{ background: role.avatarColor }}
          >
            <UserIcon color="white" />
          </div>
          <h3
            className="font-serif text-[18px] mb-1.5"
            style={{ color: role.nameColor }}
          >
            {role.name}
          </h3>
          <p
            className="text-[13px] leading-[1.55] mb-5"
            style={{ color: role.taglineColor }}
          >
            {role.tagline}
          </p>
        </div>
        <Link
          href="/register"
          className="text-center text-[12px] font-semibold py-2 px-4 rounded-[9px] text-white transition-opacity hover:opacity-90"
          style={{ background: role.ctaBg }}
        >
          {role.ctaText}
        </Link>
      </div>

      {/* Right — features + quote */}
      <div className="flex-1 bg-white p-7 border-l" style={{ borderColor: role.border }}>
        <p className="text-[11px] font-semibold text-ink-light uppercase tracking-[0.07em] mb-3.5">
          What {role.name.toLowerCase()} gets
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          {role.features.map((f) => (
            <div key={f.title} className="flex items-start gap-2.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                style={{ background: role.dotColor }}
              />
              <div>
                <p className="text-[13px] font-semibold text-ink">{f.title}</p>
                <p className="text-[11px] text-ink-mid leading-[1.5]">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div
          className="rounded-[12px] p-3.5 border-l-[3px]"
          style={{
            background: role.bg,
            borderLeftColor: role.border,
          }}
        >
          <p
            className="text-[12px] leading-[1.6] italic mb-2"
            style={{ color: role.quoteTextColor }}
          >
            &ldquo;{role.quote}&rdquo;
          </p>
          <p
            className="text-[11px] font-semibold"
            style={{ color: role.quoteAuthorColor }}
          >
            {role.quoteAuthor}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingRoles() {
  const [active, setActive] = useState<RoleKey>("student");
  const activeRole = ROLES.find((r) => r.key === active)!;

  return (
    <section id="roles" className="px-7 py-12 max-w-[1200px] mx-auto">
      <p className="text-[11px] font-semibold text-teal uppercase tracking-[0.09em] mb-2">
        Who it&apos;s for
      </p>
      <h2 className="font-serif text-[24px] text-ink mb-2">
        One platform, every stakeholder
      </h2>
      <p className="text-[13px] text-ink-mid leading-[1.7] max-w-[520px] mb-6">
        Select a role below to see how SwipeGap works for each person in a
        student&apos;s journey.
      </p>

      {/* Tab pills */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {ROLES.map((role) => (
          <button
            key={role.key}
            onClick={() => setActive(role.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border transition-colors whitespace-nowrap"
            style={
              active === role.key
                ? {
                    background: role.bg,
                    borderColor: role.border,
                    color: role.nameColor,
                  }
                : {
                    background: "#FDF9F0",
                    borderColor: "#E2D8C4",
                    color: "#5C4A2A",
                  }
            }
          >
            {role.label}
            {role.isNew && (
              <span className="text-[9px] font-bold bg-blue text-white px-1.5 py-0.5 rounded">
                NEW
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <RolePanel role={activeRole} />
    </section>
  );
}
