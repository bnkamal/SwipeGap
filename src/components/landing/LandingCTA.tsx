import Link from "next/link";

const PILLS = [
  "HSC aligned",
  "JEE ready",
  "AI-powered",
  "Career counselling",
  "Stripe payments",
];

export default function LandingCTA() {
  return (
    <section className="bg-teal">
      <div className="px-7 py-14 max-w-[1200px] mx-auto">
        <div className="max-w-[500px] mx-auto text-center">
          <p className="text-[11px] font-semibold text-teal-border uppercase tracking-[0.09em] mb-2">
            Get started today
          </p>
          <h2 className="font-serif text-[28px] text-white mb-2.5 leading-[1.2]">
            Ready to close the gap — and find the path?
          </h2>
          <p className="text-[13px] text-white/80 mb-6 leading-[1.65]">
            Join students across HSC and JEE who are studying smarter and
            planning their careers with confidence. Free to start, no credit
            card required.
          </p>

          <div className="flex gap-2.5 justify-center flex-wrap mb-6">
            <Link
              href="/register"
              className="px-6 py-3 rounded-[12px] bg-white text-teal-darker text-[14px] font-semibold hover:bg-teal-light transition-colors"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-[12px] bg-transparent text-white text-[14px] font-medium border border-white/40 hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            {PILLS.map((pill) => (
              <span
                key={pill}
                className="bg-white/15 border border-white/28 rounded-[7px] px-3 py-1.5 text-[11px] text-white/90 font-medium"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
