import type { Config } from "tailwindcss";

// Tokens sourced from DESIGN.md (Notion design language analysis).
// Scoped to app/dashboard use — marketing-only tokens (hero-band, sticker
// accents, pricing-tier variants) are kept but should rarely appear inside
// /dashboard routes. See DESIGN.md for full rationale per token.

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0075de",
          active: "#005bab",
        },
        secondary: "#213183", // reserve for a single inverted "night" surface, not general use
        ink: {
          DEFAULT: "#000000",
          secondary: "#31302e",
          muted: "#615d59",
          faint: "#a39e98",
        },
        canvas: {
          DEFAULT: "#ffffff",
          soft: "#f6f5f4", // app's default page background
        },
        surface: "#ffffff", // cards, panels, fields
        hairline: "#e6e6e6",

        // Decorative sticker palette — use ONLY in illustrations/icons,
        // never for structural fills, buttons, or status (use semantic below).
        accent: {
          sky: "#62aef0",
          purple: "#d6b6f6",
          "purple-deep": "#391c57",
          pink: "#ff64c8",
          orange: "#dd5b00",
          "orange-deep": "#793400",
          teal: "#2a9d99",
          green: "#1aae39",
          brown: "#523410",
        },

        // Semantic status colors — DESIGN.md doesn't define these (Notion's
        // marketing site has no error/success ramp), so these are project-
        // specific additions for financial states (paid/overdue/etc).
        success: { DEFAULT: "#1aae39", bg: "#ecfdf3" },
        warning: { DEFAULT: "#dd5b00", bg: "#fff7ed" },
        destructive: { DEFAULT: "#dc2626", bg: "#fef2f2" },
        info: { DEFAULT: "#62aef0", bg: "#eff6ff" },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "system-ui", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        "display-1": ["64px", { lineHeight: "1.0", letterSpacing: "-2.125px", fontWeight: "700" }],
        "display-2": ["54px", { lineHeight: "1.04", letterSpacing: "-1.875px", fontWeight: "700" }],
        "heading-1": ["40px", { lineHeight: "1.1", letterSpacing: "-1px", fontWeight: "700" }],
        "heading-2": ["26px", { lineHeight: "1.23", letterSpacing: "-0.625px", fontWeight: "700" }],
        "heading-3": ["22px", { lineHeight: "1.27", letterSpacing: "-0.25px", fontWeight: "700" }],
        title: ["20px", { lineHeight: "1.4", letterSpacing: "-0.125px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "body-sm": ["15px", { lineHeight: "1.33", letterSpacing: "0", fontWeight: "400" }],
        button: ["16px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "500" }],
        caption: ["14px", { lineHeight: "1.43", letterSpacing: "0", fontWeight: "400" }],
        eyebrow: ["12px", { lineHeight: "1.33", letterSpacing: "0.125px", fontWeight: "600" }],
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "28px",
        xxl: "32px",
      },
      borderRadius: {
        xs: "4px", // form fields, small chips
        sm: "5px", // menu items, list rows
        md: "8px", // utility/nav buttons, small cards
        lg: "12px", // feature/dashboard cards (default app card radius)
        xl: "16px", // large containers, modals
        full: "9999px", // marketing pill CTAs, badges, circular icons
      },
      boxShadow: {
        "elevation-1":
          "0 0.175px 1.041px rgba(0,0,0,0.01), 0 0.8px 2.925px rgba(0,0,0,0.02), 0 2.025px 7.847px rgba(0,0,0,0.027), 0 4px 18px rgba(0,0,0,0.04)",
        "elevation-2":
          "0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.03), 0 12px 24px rgba(0,0,0,0.04), 0 23px 52px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;