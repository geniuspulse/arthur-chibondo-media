import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        accent: "#d97706",
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          150: "#eaecef",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          450: "#828a96",
          500: "#6b7280",
          550: "#596169",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          850: "#181f29",
          900: "#111827",
          950: "#030712",
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
