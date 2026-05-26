import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0ea5e9",
          light: "#38bdf8",
          dark: "#0284c7",
        },
        accent: {
          DEFAULT: "#06d6a0",
          light: "#2ef5c0",
          dark: "#00b386",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        bg: {
          dark: "#0a0e27",
          medium: "#0f1535",
          card: "rgba(15, 23, 42, 0.6)",
          glass: "rgba(255, 255, 255, 0.05)",
        },
        glass: {
          border: "rgba(255, 255, 255, 0.08)",
          bg: "rgba(255, 255, 255, 0.04)",
          hover: "rgba(255, 255, 255, 0.08)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse at center, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
        "accent-glow":
          "radial-gradient(ellipse at center, rgba(6, 214, 160, 0.12) 0%, transparent 70%)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans SC",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(14, 165, 233, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(14, 165, 233, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
