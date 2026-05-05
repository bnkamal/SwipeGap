import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export default function LandingFooter() {
  return (
    <footer className="bg-cream-mid border-t border-cream-border">
      <div className="px-7 py-5 max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-3">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="SwipeGap"
            width={110}
            height={34}
            className="h-[30px] w-auto object-contain"
          />
        </Link>
        <span className="text-[11px] text-ink-light">
          © {new Date().getFullYear()} SwipeGap. Built for K-12 learners.
        </span>
        <div className="flex gap-3.5">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[11px] text-ink-mid hover:text-teal transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
