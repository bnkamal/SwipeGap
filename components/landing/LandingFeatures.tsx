import { ReactNode } from "react";

interface FeatureWideProps {
  iconBg: string;
  icon: ReactNode;
  title: ReactNode;
  desc: string;
  chip: string;
  chipStyle: string;
  cardStyle?: string;
}

interface FeatureCompactProps {
  iconBg: string;
  icon: ReactNode;
  title: string;
  desc: string;
  chip: string;
  chipStyle: string;
}

function FeatureWide({
  iconBg,
  icon,
  title,
  desc,
  chip,
  chipStyle,
  cardStyle = "",
}: FeatureWideProps) {
  return (
    <div
      className={`flex gap-4 items-start bg-cream border border-cream-border rounded-[18px] p-[22px] ${cardStyle}`}
    >
      <div
        className={`w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-sans text-[14px] font-bold text-ink mb-1.5">
          {title}
        </h3>
        <p className="text-[12px] text-ink-mid leading-[1.6]">{desc}</p>
        <span
          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-[5px] mt-2.5 ${chipStyle}`}
        >
          {chip}
        </span>
      </div>
    </div>
  );
}

function FeatureCompact({
  iconBg,
  icon,
  title,
  desc,
  chip,
  chipStyle,
}: FeatureCompactProps) {
  return (
    <div className="flex flex-col bg-cream border border-cream-border rounded-[18px] p-[20px]">
      <div
        className={`w-10 h-10 rounded-[11px] flex items-center justify-center mb-3 ${iconBg}`}
      >
        {icon}
      </div>
      <h3 className="font-sans text-[13px] font-bold text-ink mb-1.5">
        {title}
      </h3>
      <p className="text-[11px] text-ink-mid leading-[1.6] flex-1">{desc}</p>
      <span
        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-[5px] mt-2.5 w-fit ${chipStyle}`}
      >
        {chip}
      </span>
    </div>
  );
}

export default function LandingFeatures() {
  return (
    <section
      id="features"
      className="bg-cream-mid border-t border-b border-cream-border"
    >
      <div className="px-7 py-12 max-w-[1200px] mx-auto">
        <p className="text-[11px] font-semibold text-teal uppercase tracking-[0.09em] mb-2">
          Features
        </p>
        <h2 className="font-serif text-[24px] text-ink mb-2">
          Built to take students from gap to goal
        </h2>
        <p className="text-[13px] text-ink-mid leading-[1.7] max-w-[520px] mb-7">
          Every feature is designed around one purpose: get students from
          knowledge gap to exam confidence to a clear career direction.
        </p>

        <div className="flex flex-col gap-3">
          {/* Top row — 2 wide cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FeatureWide
              iconBg="bg-teal-light"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="10"
                    r="7.5"
                    stroke="#1D9E75"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M7 10l2.5 2.5 4.5-4.5"
                    stroke="#1D9E75"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              title="AI-powered gap detection"
              desc="Claude API analyses swipe patterns across all your topics and surfaces your highest-leverage gaps first — not just what you got wrong, but why it matters for your exam."
              chip="Powered by Claude"
              chipStyle="bg-teal-light text-teal-darker"
            />
            <FeatureWide
              cardStyle="border-blue-border bg-blue-light/30"
              iconBg="bg-blue-light"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 2.5l1.8 4 4.4.6-3.2 3.1.8 4.4L10 12.5l-3.8 2.1.8-4.4L3.8 7.1l4.4-.6z"
                    stroke="#185FA5"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 16.5h6M10 14v2.5"
                    stroke="#185FA5"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title={
                <>
                  Career counselling{" "}
                  <span className="inline-block text-[9px] font-bold bg-blue text-white px-1.5 py-0.5 rounded ml-1 align-middle">
                    NEW
                  </span>
                </>
              }
              desc="AI cross-references subject strengths, gap history, and student interests to recommend the most suitable university courses, TAFE pathways, and career directions — ranked by fit."
              chip="Students & parents"
              chipStyle="bg-blue-light text-blue-dark"
            />
          </div>

          {/* Bottom row — 3 compact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FeatureCompact
              iconBg="bg-purple-light"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="7"
                    r="3.5"
                    stroke="#534AB7"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M3.5 18c0-3.866 2.91-6 6.5-6s6.5 2.134 6.5 6"
                    stroke="#534AB7"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="Mentor oversight"
              desc="Mentors see each student's gap map, set learning plans, assign targeted sessions, and track mastery over time."
              chip="For tutors"
              chipStyle="bg-purple-light text-purple-dark"
            />
            <FeatureCompact
              iconBg="bg-amber-light"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="3"
                    y="5"
                    width="14"
                    height="11"
                    rx="2.5"
                    stroke="#BA7517"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M7 9.5h6M7 12.5h4"
                    stroke="#BA7517"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="Parent progress reports"
              desc="Parents get clear weekly summaries of topic mastery, gap trends, and now career pathway recommendations too."
              chip="For families"
              chipStyle="bg-amber-light text-amber-dark"
            />
            <FeatureCompact
              iconBg="bg-coral-light"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3.5 14.5l4.5-4.5 3 3 6-7"
                    stroke="#D85A30"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              title="Spaced repetition engine"
              desc="Cards you struggle with return more often. The algorithm adapts daily — the harder the gap, the sharper the drill."
              chip="Science-backed"
              chipStyle="bg-coral-light text-coral-dark"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
