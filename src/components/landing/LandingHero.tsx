import Link from "next/link";

const SWIPE_CARDS = [
  {
    subject: "Mathematics · HSC",
    title: "Trigonometry identities",
    meta: "12 questions remaining",
    bg: "bg-purple",
    rotate: "-rotate-[6deg]",
    anim: "animate-float-1",
    top: "top-0",
    left: "left-[22px]",
  },
  {
    subject: "Chemistry · JEE",
    title: "Organic reactions",
    meta: "Gap detected by AI",
    bg: "bg-coral",
    rotate: "rotate-[2deg]",
    anim: "animate-float-2",
    top: "top-[17px]",
    left: "left-[12px]",
  },
  {
    subject: "Career · Counselling",
    title: "Your path to medicine",
    meta: "3 options matched",
    bg: "bg-teal",
    rotate: "-rotate-[1.5deg]",
    anim: "animate-float-3",
    top: "top-[34px]",
    left: "left-[2px]",
  },
];

const TRUST_ITEMS = [
  "Free to start",
  "K-12 aligned",
  "Powered by Claude AI",
  "Career counselling",
];

function CheckIcon() {
  return (
    <span className="w-[15px] h-[15px] rounded-full bg-teal-light border border-teal-border flex items-center justify-center flex-shrink-0">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path
          d="M1.5 4l1.8 1.8 3-3"
          stroke="#1D9E75"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function LandingHero() {
  return (
    <section className="flex items-start gap-6 px-7 pt-12 pb-10 border-b border-cream-border max-w-[1200px] mx-auto">
      {/* Left content */}
      <div className="flex-1 min-w-0">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 bg-teal-light border border-teal-border rounded-full px-3 py-1 text-[11px] font-medium text-teal-darker mb-5">
          <span className="w-[5px] h-[5px] rounded-full bg-teal" />
          Now live — HSC, JEE &amp; career guidance
        </div>

        {/* Headline */}
        <h1 className="font-serif text-[34px] leading-[1.15] tracking-tight text-ink mb-3">
          Swipe your gap.
          <br />
          <em className="not-italic text-teal">Ace your exam.</em>
          <br />
          Own your future.
        </h1>

        {/* Subheading */}
        <p className="text-[14px] text-ink-mid leading-[1.75] max-w-[390px] mb-6">
          SwipeGap uses AI to find exactly what you don't know, closes it one
          card at a time — and now guides students toward the right career path.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-2.5 mb-6 flex-wrap">
          <Link
            href="/register"
            className="px-5 py-3 rounded-[13px] bg-teal text-white text-[14px] font-semibold hover:bg-teal-dark transition-colors"
          >
            Start for free
          </Link>
          <a
            href="#how-it-works"
            className="px-5 py-3 rounded-[13px] bg-cream text-ink text-[14px] font-medium border border-cream-border hover:bg-cream-mid hover:border-teal-border transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* Trust indicators */}
        <div className="flex gap-3.5 flex-wrap">
          {TRUST_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <CheckIcon />
              <span className="text-[12px] text-ink-light">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — animated card stack */}
      <div className="w-[200px] flex-shrink-0 relative h-[248px] hidden sm:block">
        {SWIPE_CARDS.map((card) => (
          <div
            key={card.title}
            className={`absolute w-[178px] rounded-[18px] p-4 ${card.bg} ${card.rotate} ${card.anim} ${card.top} ${card.left}`}
          >
            <p className="text-[9px] text-white/60 uppercase tracking-[0.07em] mb-0.5">
              {card.subject}
            </p>
            <p className="text-[14px] font-bold text-white font-serif leading-tight mb-1">
              {card.title}
            </p>
            <p className="text-[10px] text-white/60">{card.meta}</p>
            <div className="flex gap-1 mt-2">
              <span className="w-[19px] h-[19px] rounded-[5px] bg-white/20" />
              <span className="w-[19px] h-[19px] rounded-[5px] bg-white/20" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
