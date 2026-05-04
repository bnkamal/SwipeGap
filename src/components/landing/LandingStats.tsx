const STATS = [
  { num: "200+", label: "Topics covered", green: true },
  { num: "AI", label: "Gap detection", green: true },
  { num: "K–12", label: "All levels", green: false },
  { num: "5", label: "Roles supported", green: false },
  { num: "NEW", label: "Career counselling", green: true },
];

export default function LandingStats() {
  return (
    <div className="flex border-b border-cream-border bg-cream-mid">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex-1 py-3.5 px-2 text-center ${
            i < STATS.length - 1 ? "border-r border-cream-border" : ""
          }`}
        >
          <p
            className={`font-serif text-[20px] font-bold leading-none ${
              stat.green ? "text-teal" : "text-ink"
            }`}
          >
            {stat.num}
          </p>
          <p className="text-[11px] text-ink-light mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
