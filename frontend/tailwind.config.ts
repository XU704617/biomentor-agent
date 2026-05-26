import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#0d0d1a",
          muted: "#4a4a6a",
          faint: "#8e8eaa",
        },
        surface: {
          base: "rgba(250, 248, 255, 1)",
          canvas: "rgba(240, 244, 255, 1)",
          glass: "rgba(255, 255, 255, 0.6)",
          heavy: "rgba(255, 255, 255, 0.85)",
          hover: "rgba(255, 255, 255, 0.9)",
        },
        accent: {
          electric: "#2563eb",
          cyan: "#06b6d4",
          glow: "rgba(37, 99, 235, 0.12)",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', "system-ui", "sans-serif"],
        body: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "reveal-up": "revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "reveal-up-1": "revealUp 0.6s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both",
        "reveal-up-2": "revealUp 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
        "reveal-up-3": "revealUp 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "reveal-up-4": "revealUp 0.6s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        revealUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
