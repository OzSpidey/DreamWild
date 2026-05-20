import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080608",
          900: "#0f0d0a",
          800: "#1a1714",
          700: "#252119",
          600: "#332d22",
        },
        parchment: {
          50:  "#faf8f1",
          100: "#f5f0e0",
          200: "#e8e0c8",
          300: "#d4c9a8",
          400: "#bfaf88",
        },
        gold: {
          300: "#f0d070",
          400: "#e8c040",
          500: "#c9a84c",
          600: "#a88838",
          700: "#7d6428",
        },
      },
      fontFamily: {
        serif:  ["var(--font-playfair)", "Georgia", "serif"],
        body:   ["var(--font-crimson)", "Georgia", "serif"],
        sans:   ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "parchment-gradient": "radial-gradient(ellipse at top, #1a1714 0%, #080608 60%)",
        "gold-glow":          "radial-gradient(ellipse, rgba(201,168,76,0.15) 0%, transparent 70%)",
      },
      keyframes: {
        blink:        { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        "quill-pulse": { "0%,100%": { transform: "rotate(-5deg)" }, "50%": { transform: "rotate(5deg)" } },
        "fade-up":    { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        blink:         "blink 1s step-end infinite",
        "quill-pulse": "quill-pulse 2s ease-in-out infinite",
        "fade-up":     "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
