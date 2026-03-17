/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F5",
        surface: "#F2EDE6",
        border: "#E0D8CE",
        "text-primary": "#1C1917",
        "text-secondary": "#6B6560",
        "text-muted": "#A89F98",
        accent: "#8B5E3C",
        "accent-hover": "#704A2E",
        "accent-light": "#F5EDE4",
        "admin-dark": "#1C1917",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "hero": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.1" }],
        "section": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.2" }],
      },
      spacing: {
        "section": "5rem",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};