import { Metadata } from "next";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingStats from "@/components/landing/LandingStats";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingRoles from "@/components/landing/LandingRoles";
import LandingCareerSpotlight from "@/components/landing/LandingCareerSpotlight";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "SwipeGap — Swipe Your Gap. Ace Your Exam.",
  description:
    "AI-powered micro-tutoring platform for K-12 students in Australia and India. Find your knowledge gaps, close them with swipe cards, and discover your ideal career pathway.",
  openGraph: {
    title: "SwipeGap — Swipe Your Gap. Ace Your Exam.",
    description: "Swipe Your Gap. Ace Your Exam. Own your future.",
    url: "https://swipegap.com",
    siteName: "SwipeGap",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SwipeGap",
    description: "Swipe Your Gap. Ace Your Exam.",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream font-sans">
      <LandingNav />
      <LandingHero />
      <LandingStats />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingRoles />
      <LandingCareerSpotlight />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
