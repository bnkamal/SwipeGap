const SPOTLIGHT_ITEMS = [
  {
    title: "Strength mapping",
    desc: "AI identifies subject strengths from swipe history and correlates them to career suitability scores.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 2l1.4 3.2 3.5.5-2.6 2.5.6 3.5L9 10l-2.9 1.7.6-3.5L4.1 5.7l3.5-.5z"
          stroke="#185FA5"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Pathway matching",
    desc: "Recommends university courses, TAFE pathways, and career options ranked by student-fit score.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M2 13l4-4 2.5 2.5 5.5-6"
          stroke="#185FA5"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Counsellor dashboard",
    desc: "Career counsellors see every student's profile, gap map, and matched pathways in a single view.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="5" width="14" height="10" rx="2" stroke="#185FA5" strokeWidth="1.2" />
        <path d="M6 5V4a3 3 0 016 0v1" stroke="#185FA5" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Parent visibility",
    desc: "Parents see career pathway recommendations alongside academic progress in their weekly digest.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="6" cy="6.5" r="2.5" stroke="#185FA5" strokeWidth="1.2" />
        <path d="M2 15c0-2.5 1.79-3.5 4-3.5s4 1 4 3.5" stroke="#185FA5" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M12 8l1.5 1.5 3-2.5" stroke="#185FA5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function LandingCareerSpotlight() {
  return (
    <section className="bg-cream-mid border-t border-b border-cream-border">
      <div className="px-7 py-12 max-w-[1200px] mx-auto">
        <p className="text-[11px] font-semibold text-teal uppercase tracking-[0.09em] mb-2">
          Career counselling spotlight
        </p>
        <h2 className="font-serif text-[24px] text-ink mb-2">
          From gap closed to career chosen
        </h2>
        <p className="text-[13px] text-ink-mid leading-[1.7] max-w-[560px] mb-7">
          Once a student&apos;s knowledge gaps are mapped, SwipeGap AI
          cross-references strengths, interests, and subject performance to
          recommend the most suitable university courses and career pathways —
          giving students, parents, and counsellors a shared, clear picture of
          what comes next.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SPOTLIGHT_ITEMS.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-blue-border rounded-[16px] p-[18px] flex gap-3 items-start"
            >
              <div className="w-9 h-9 rounded-[10px] bg-blue-light flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-blue-dark mb-1">
                  {item.title}
                </h3>
                <p className="text-[12px] text-blue leading-[1.55]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
