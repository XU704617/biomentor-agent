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
          DEFAULT: "#2563eb",
          light: "#3b82f6",
          dark: "#1d4ed8",
          subtle: "#eff6ff",
          glow: "rgba(37,99,235,0.08)",
        },
        success: {
          DEFAULT: "#059669",
          light: "#10b981",
          dark: "#047857",
          subtle: "#ecfdf5",
        },
        danger: {
          DEFAULT: "#dc2626",
          light: "#ef4444",
          dark: "#b91c1c",
          subtle: "#fef2f2",
        },
        surface: {
          base: "#f5f5f7",
          raised: "#ffffff",
          overlay: "rgba(255,255,255,0.72)",
          field: "#f9fafb",
        },
        border: {
          subtle: "#e5e5e7",
          muted: "#d4d4d8",
          active: "#a1a1aa",
        },
      },
      fontFamily: {
        body: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ['"SF Mono"', '"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      animation: {
        "reveal": "reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "reveal-delay-1": "reveal 0.4s 0.05s cubic-bezier(0.16, 1, 0.3, 1) both",
        "reveal-delay-2": "reveal 0.4s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both",
        "reveal-delay-3": "reveal 0.4s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both",
        "reveal-delay-4": "reveal 0.4s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        reveal: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
