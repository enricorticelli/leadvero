import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#F3F0FF",
          100: "#E6DFFF",
          200: "#CCBEFF",
          300: "#AF9BFF",
          400: "#957EFF",
          500: "#7B61FF",
          600: "#6A4FEA",
          700: "#553DC2",
          800: "#402D91",
          900: "#2B1E66",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted:   "#F7F8FC",
          sunken:  "#EEF0F7",
        },
        ink: {
          900: "#111827",
          700: "#374151",
          500: "#6B7280",
          400: "#9CA3AF",
          300: "#D1D5DB",
        },
        tile: {
          "pink-bg":     "#FEE4E2",
          "pink-icon":   "#F97066",
          "orange-bg":   "#FEECDC",
          "orange-icon": "#F79009",
          "green-bg":    "#DCFAE6",
          "green-icon":  "#12B76A",
          "violet-bg":   "#ECE9FE",
          "violet-icon": "#7B61FF",
          "yellow-bg":   "#FEF7C3",
          "yellow-icon": "#EAAA08",
          "blue-bg":     "#DBEAFE",
          "blue-icon":   "#2E90FA",
        },
      },
      borderRadius: {
        xl:  "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.04)",
        "card-hover": "0 4px 12px rgba(16,24,40,0.06), 0 2px 4px rgba(16,24,40,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
