/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy class names remapped to iOS-style palette so existing components inherit the new look.
        // Light surfaces use white / #F5F5F7; dark surfaces use Apple's #1C1C1E family.
        navy: {
          DEFAULT: "#1C1C1E",   // dark page background + dark cards
          2:       "#2C2C2E",   // slightly elevated dark surface
          3:       "#3A3A3C",
        },
        cream: {
          DEFAULT: "#FFFFFF",   // light page background
          2:       "#F5F5F7",   // elevated light surface (iOS system gray 6)
        },
        brass: {
          DEFAULT: "#007AFF",   // iOS blue, used for interactive/accent
          2:       "#0A84FF",   // dark-mode iOS blue
          dim:     "#86868B",   // for muted "brass" usages
        },
        blood: {
          DEFAULT: "#C8252A",   // critical / OCEBM / score highlight — slightly flatter iOS-ish red
        },
        ink: {
          DEFAULT: "#1D1D1F",   // primary text on light bg
          2:       "#6E6E73",   // secondary / muted text on light bg
        },
        leaf: {
          DEFAULT: "#98989D",   // secondary text on dark bg
        },
        // Semantic tokens (used by new components)
        accent: "#007AFF",
        divider: "rgba(60,60,67,0.18)",
        success: "#34C759",

        // Token-driven palette (existing wiring via index.css :root vars)
        bg: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          subtle:  "rgb(var(--bg-subtle) / <alpha-value>)",
          card:    "rgb(var(--bg-card) / <alpha-value>)",
        },
        fg: {
          DEFAULT: "rgb(var(--fg) / <alpha-value>)",
          muted:   "rgb(var(--fg-muted) / <alpha-value>)",
          subtle:  "rgb(var(--fg-subtle) / <alpha-value>)",
        },
        border: { DEFAULT: "rgb(var(--border) / <alpha-value>)" },
      },
      fontFamily: {
        sans:    ["-apple-system", "BlinkMacSystemFont", '"SF Pro Display"', '"SF Pro Text"', "Inter", "system-ui", "sans-serif"],
        serif:   ["-apple-system", "BlinkMacSystemFont", '"SF Pro Display"', "Inter", "system-ui", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Display"', "Inter", "system-ui", "sans-serif"],
        mono:    ['"SF Mono"', "Menlo", "Consolas", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs":  ["11px", { lineHeight: "1.4",  letterSpacing: "0.02em" }],
        "xs":   ["13px", { lineHeight: "1.4" }],
        "sm":   ["15px", { lineHeight: "1.45" }],
        "base": ["17px", { lineHeight: "1.5" }],
        "lg":   ["19px", { lineHeight: "1.45" }],
        "xl":   ["22px", { lineHeight: "1.35" }],
        "2xl":  ["26px", { lineHeight: "1.3" }],
        "3xl":  ["32px", { lineHeight: "1.2" }],
        "4xl":  ["40px", { lineHeight: "1.1" }],
        "5xl":  ["56px", { lineHeight: "1.05" }],
      },
      borderRadius: {
        sm:    "8px",
        DEFAULT: "12px",
        md:    "14px",
        lg:    "16px",
        xl:    "20px",
        "2xl": "28px",
      },
      boxShadow: {
        // iOS-style soft shadow for cards
        card:   "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.06)",
        feature:"0 2px 4px rgba(0,0,0,0.04), 0 16px 40px -12px rgba(0,0,0,0.10)",
      },
      letterSpacing: {
        editorial: "0.14em",
      },
    },
  },
  plugins: [],
};
