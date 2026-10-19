import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRD Tokens
        "bg-surface": "#FFFFFF",
        "bg-card": "#F8F9FA",
        "brand-purple": "#5E17EB",
        "canvas-purple-start": "#4A00E0",
        "canvas-purple-end": "#2E008B",
        "brand-pink": "#FF4D8D",
        "brand-yellow": "#FFC700",
        "text-primary": "#111111",

        // VOCA Brand Tokens
        voca: {
          blue: "#21649D",
          yellow: "#F6B12E",
          green: "#38AD4F",
          red: "#E42130",
          navy: "#0F1D2B",
          dark: "#16232E",
          card: "#F8F9FA",
        },

        // Utility Tokens
        whatsapp: "#25D366",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
        fredoka: ["var(--font-fredoka)", "cursive", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
