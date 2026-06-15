/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Varsity Codex palette
        navy: {
          DEFAULT: "#0F2540",
          2: "#102B4A",
          3: "#1E3656",
        },
        brass: {
          DEFAULT: "#B89968",
          2: "#C5A87A",
          dim: "#8E8369",
        },
        cream: {
          DEFAULT: "#F4ECDB",
          2: "#EBE1C7",
        },
        blood: {
          DEFAULT: "#9E2A2B",
        },
        ink: {
          DEFAULT: "#4A3E2A",
          2: "#5A4A2A",
        },
        leaf: {
          DEFAULT: "#C5BDA0",
        },
        // Legacy/semantic aliases used by old components — map to new palette
        bg: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          subtle: "rgb(var(--bg-subtle) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
        },
        fg: {
          DEFAULT: "rgb(var(--fg) / <alpha-value>)",
          muted: "rgb(var(--fg-muted) / <alpha-value>)",
          subtle: "rgb(var(--fg-subtle) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
        },
        tier: {
          1: "rgb(var(--tier-1) / <alpha-value>)",
          2: "rgb(var(--tier-2) / <alpha-value>)",
          3: "rgb(var(--tier-3) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Source Serif Pro", "ui-serif", "Georgia", "serif"],
        display: ["Noto Serif Display", "Source Serif Pro", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        editorial: "0.3em",
      },
    },
  },
  plugins: [],
};
