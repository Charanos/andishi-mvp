module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.{css}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Properly reference CSS variables
        fontNunito: ["var(--font-nunito)", "sans-serif"],
        fontMontserrat: ["var(--font-montserrat)", "sans-serif"],
      },
      colors: {
        dark: "#0B0D0E",
        offdark: "#121317",
        primary: "#00C6FB",
        purple: "#7F5CFF",
        magenta: "#FF00EA",
      },
    },
  },
  darkMode: 'class', 
  plugins: [
    require("@tailwindcss/forms"),
    require('@tailwindcss/typography'),
  ],
};