const STEPS = [
  {
    num: "1",
    numBg: "bg-teal-light",
    numColor: "text-teal-darker",
    title: "Swipe to reveal gaps",
    desc: "Answer swipe-card questions across subjects. Right for confident, left for needs work — takes minutes, not hours.",
  },
  {
    num: "2",
    numBg: "bg-amber-light",
    numColor: "text-amber-dark",
    title: "AI maps your knowledge",
    desc: "Claude AI analyses your swipe pattern and builds a priority list of exactly what to study first.",
  },
  {
    num: "3",
    numBg: "bg-purple-light",
    numColor: "text-purple-dark",
    title: "Close gaps, own your future",
    desc: "Targeted cards close revision gaps. Career AI then maps your strengths to the right career and course pathway.",
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="px-7 py-12 max-w-[1200px] mx-auto">
      <p className="text-[11px] font-semibold text-teal uppercase tracking-[0.09em] mb-2">
        How it works
      </p>
      <h2 className="font-serif text-[24px] text-ink mb-2">
        Three steps to exam confidence — and beyond
      </h2>
      <p className="text-[13px] text-ink-mid leading-[1.7] max-w-[520px] mb-7">
        SwipeGap's AI maps what you know, surfaces what you don't, drills it
        with spaced repetition, and now matches students to the right career
        path.
      </p>

      <div className="flex gap-3 flex-wrap">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className="flex-1 min-w-[160px] bg-cream border border-cream-border rounded-[16px] p-[18px]"
          >
            <div
              className={`w-7 h-7 rounded-[8px] flex items-center justify-center text-[12px] font-bold mb-2.5 ${step.numBg} ${step.numColor}`}
            >
              {step.num}
            </div>
            <h3 className="font-sans text-[13px] font-semibold text-ink mb-1.5">
              {step.title}
            </h3>
            <p className="text-[11px] text-ink-mid leading-[1.55]">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
