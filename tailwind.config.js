/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f7f9",
        surface: "#ffffff",
        ink: {
          DEFAULT: "#1f2937",
          soft: "#4b5563",
          faint: "#9ca3af",
        },
        line: "#e5e7eb",
        brand: {
          DEFAULT: "#2563eb",
          soft: "#eff6ff",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        panel: "-8px 0 24px -12px rgb(0 0 0 / 0.18)",
      },
    },
  },
  plugins: [],
};
