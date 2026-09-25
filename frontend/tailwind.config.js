/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1B3A",
          light: "#132A5E",
          dark: "#070F24",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E0C158",
          dark: "#9A7B1B",
        },
        accentblue: {
          DEFAULT: "#2563EB",
          light: "#60A5FA",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
