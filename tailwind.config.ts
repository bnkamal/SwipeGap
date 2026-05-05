import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Original SwipeGap brand colours (keep existing app working) ── */
        "brand-blue":   "#1A4D8F",
        "brand-teal":   "#0D7A5F",
        "brand-orange": "#E87722",
        "gap-red":      "#EF4444",
        "gap-green":    "#22C55E",
        "gap-amber":    "#F59E0B",
        "gap-gray":     "#94A3B8",

        /* ── Landing page cream palette ── */
        cream: {
          DEFAULT: "#FDF9F0",
          mid:     "#F5EDD8",
          border:  "#E2D8C4",
          dark:    "#EDE0C4",
        },
        ink: {
          DEFAULT: "#1E1206",
          mid:     "#5C4A2A",
          light:   "#9A8060",
          faint:   "#C4B89A",
        },

        /* ── Landing page role colours ── */
        teal: {
          DEFAULT: "#1D9E75",
          dark:    "#0F6E56",
          darker:  "#085041",
          light:   "#E1F5EE",
          border:  "#9FE1CB",
          mid:     "#5DCAA5",
        },
        purple: {
          DEFAULT: "#534AB7",
          dark:    "#3C3489",
          light:   "#EEEDFE",
          border:  "#AFA9EC",
        },
        coral: {
          DEFAULT: "#D85A30",
          dark:    "#712B13",
          light:   "#FAECE7",
          border:  "#F5C4B3",
        },
        amber: {
          DEFAULT: "#BA7517",
          dark:    "#633806",
          light:   "#FAEEDA",
          border:  "#FAC775",
        },
        blue: {
          DEFAULT: "#185FA5",
          dark:    "#0C447C",
          light:   "#E6F1FB",
          border:  "#85B7EB",
          mid:     "#378ADD",
        },
      },
      fontFamily: {
        sans:  ["var(--font-dm-sans)",   "system-ui", "sans-serif"],
        serif: ["var(--font-dm-serif)",  "Georgia",   "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      animation: {
        "float-1": "float1 4s ease-in-out infinite",
        "float-2": "float2 4.5s ease-in-out 0.3s infinite",
        "float-3": "float3 3.8s ease-in-out 0.6s infinite",
      },
      keyframes: {
        float1: {
          "0%, 100%": { transform: "rotate(-6deg) translateY(0px)" },
          "50%":      { transform: "rotate(-6deg) translateY(-6px)" },
        },
        float2: {
          "0%, 100%": { transform: "rotate(2deg) translateY(0px)" },
          "50%":      { transform: "rotate(2deg) translateY(-4px)" },
        },
        float3: {
          "0%, 100%": { transform: "rotate(-1.5deg) translateY(0px)" },
          "50%":      { transform: "rotate(-1.5deg) translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
