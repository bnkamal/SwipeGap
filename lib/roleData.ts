export type RoleKey = "student" | "mentor" | "parent" | "counsellor" | "admin";

export interface RoleFeature {
  title: string;
  desc: string;
}

export interface RoleData {
  key: RoleKey;
  label: string;
  isNew?: boolean;
  avatarColor: string;
  bg: string;
  border: string;
  nameColor: string;
  taglineColor: string;
  ctaBg: string;
  ctaText: string;
  quoteBorder: string;
  quoteTextColor: string;
  quoteAuthorColor: string;
  dotColor: string;
  name: string;
  tagline: string;
  quote: string;
  quoteAuthor: string;
  features: RoleFeature[];
}

export const ROLES: RoleData[] = [
  {
    key: "student",
    label: "Student",
    avatarColor: "#534AB7",
    bg: "#EEEDFE",
    border: "#AFA9EC",
    nameColor: "#3C3489",
    taglineColor: "#534AB7",
    ctaBg: "#534AB7",
    ctaText: "Start as a student",
    quoteBorder: "#AFA9EC",
    quoteTextColor: "#3C3489",
    quoteAuthorColor: "#534AB7",
    dotColor: "#534AB7",
    name: "Student",
    tagline:
      "Swipe through topics, close your gaps, and track mastery — all guided by AI that knows exactly what to prioritise next.",
    quote:
      "I used to study everything and hope for the best. SwipeGap told me exactly what to fix and my mock score jumped 22 points.",
    quoteAuthor: "Priya S. — Year 12, HSC Mathematics",
    features: [
      {
        title: "AI gap priority list",
        desc: "Ranked list of your weakest topics — updated after every swipe session.",
      },
      {
        title: "Swipe card revision",
        desc: "Rapid-fire cards calibrated to your gaps. Right = confident, left = work needed.",
      },
      {
        title: "Progress dashboard",
        desc: "Real-time mastery tracking across all subjects and topics.",
      },
      {
        title: "Career pathway match",
        desc: "AI maps your strengths to university courses and career directions that suit you.",
      },
    ],
  },
  {
    key: "mentor",
    label: "Mentor",
    avatarColor: "#1D9E75",
    bg: "#E1F5EE",
    border: "#9FE1CB",
    nameColor: "#085041",
    taglineColor: "#0F6E56",
    ctaBg: "#1D9E75",
    ctaText: "Start as a mentor",
    quoteBorder: "#9FE1CB",
    quoteTextColor: "#085041",
    quoteAuthorColor: "#1D9E75",
    dotColor: "#1D9E75",
    name: "Mentor",
    tagline:
      "See exactly where each student is struggling, set targeted learning plans, and walk into every session already knowing what to focus on.",
    quote:
      "The gap maps are gold. I walk into every session already knowing what each student needs — it's completely changed how I teach.",
    quoteAuthor: "Arjun R. — HSC Physics mentor",
    features: [
      {
        title: "Student gap maps",
        desc: "Visual breakdown of every student's knowledge gaps, updated in real time.",
      },
      {
        title: "Learning plan builder",
        desc: "Set topic priorities and session goals for each student individually.",
      },
      {
        title: "Mastery tracking",
        desc: "Watch students close gaps over time with clear before/after progress data.",
      },
      {
        title: "Session insights",
        desc: "Pre-session briefs show you exactly where to focus in each tutoring hour.",
      },
    ],
  },
  {
    key: "parent",
    label: "Parent",
    avatarColor: "#BA7517",
    bg: "#FAEEDA",
    border: "#FAC775",
    nameColor: "#633806",
    taglineColor: "#854F0B",
    ctaBg: "#BA7517",
    ctaText: "Start as a parent",
    quoteBorder: "#FAC775",
    quoteTextColor: "#633806",
    quoteAuthorColor: "#BA7517",
    dotColor: "#BA7517",
    name: "Parent",
    tagline:
      "Get a clear, jargon-free view of your child's academic progress and career direction — without needing to understand the exam detail.",
    quote:
      "The weekly report actually makes sense. I can see where my son is at and what career paths fit him — without needing to nag.",
    quoteAuthor: "Meena K. — Parent, Year 12 student",
    features: [
      {
        title: "Weekly digest",
        desc: "Plain-English summary of topic mastery, gap trends, and study streaks.",
      },
      {
        title: "Milestone alerts",
        desc: "Notified when your child closes a major gap or hits a mastery milestone.",
      },
      {
        title: "Career pathway view",
        desc: "See which university courses and careers the AI recommends based on strengths.",
      },
      {
        title: "Mentor updates",
        desc: "Stay in the loop on mentor session notes and progress goals.",
      },
    ],
  },
  {
    key: "counsellor",
    label: "Career counsellor",
    isNew: true,
    avatarColor: "#185FA5",
    bg: "#E6F1FB",
    border: "#85B7EB",
    nameColor: "#0C447C",
    taglineColor: "#185FA5",
    ctaBg: "#185FA5",
    ctaText: "Start as a counsellor",
    quoteBorder: "#85B7EB",
    quoteTextColor: "#0C447C",
    quoteAuthorColor: "#185FA5",
    dotColor: "#185FA5",
    name: "Career counsellor",
    tagline:
      "Access every student's academic gap map and AI-generated career pathway recommendations — so your guidance sessions are evidence-based and personalised.",
    quote:
      "Having the AI pre-screen career options based on each student's actual performance makes my sessions so much more productive.",
    quoteAuthor: "Dr. Sarah M. — School career counsellor",
    features: [
      {
        title: "Strength gap reports",
        desc: "Full academic profile for each student — gaps, strengths, and trend data.",
      },
      {
        title: "Career pathway matching",
        desc: "AI-ranked list of courses and careers matched to student performance and interests.",
      },
      {
        title: "Cohort overview",
        desc: "See all students at a glance — filter by career interest, subject strength, or risk flag.",
      },
      {
        title: "Session prep briefs",
        desc: "One-page student summary auto-generated before each counselling session.",
      },
    ],
  },
  {
    key: "admin",
    label: "Admin",
    avatarColor: "#D85A30",
    bg: "#FAECE7",
    border: "#F5C4B3",
    nameColor: "#712B13",
    taglineColor: "#993C1D",
    ctaBg: "#D85A30",
    ctaText: "Start as an admin",
    quoteBorder: "#F5C4B3",
    quoteTextColor: "#712B13",
    quoteAuthorColor: "#D85A30",
    dotColor: "#D85A30",
    name: "Admin",
    tagline:
      "Manage users, oversee billing, and monitor platform-wide analytics — everything you need to run SwipeGap at institutional scale.",
    quote:
      "Rolling SwipeGap out across our school was seamless. The admin panel gives us full visibility without any IT overhead.",
    quoteAuthor: "Mark T. — Head of curriculum, Sydney Grammar",
    features: [
      {
        title: "User management",
        desc: "Add, remove, and assign roles for students, mentors, parents, and counsellors.",
      },
      {
        title: "Stripe billing",
        desc: "Manage subscriptions, view invoices, and handle plan upgrades all in one place.",
      },
      {
        title: "Platform analytics",
        desc: "Usage stats, engagement rates, and gap-closure metrics across the whole school.",
      },
      {
        title: "Content management",
        desc: "Upload and manage swipe card decks, topic libraries, and question banks.",
      },
    ],
  },
];
