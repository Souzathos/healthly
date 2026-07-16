/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        accent: "#c8f53a",
        accent2: "#5af5a0",
        dark: "#080808",
        surface: "#111111",
        surface2: "#181818",
        line: "#222222",
        muted: "#888888",
        danger: "#e05c5c",
      },
      fontFamily: {
        sans: ["DMSans_400Regular"],
        medium: ["DMSans_500Medium"],
        semibold: ["DMSans_600SemiBold"],
        bold: ["DMSans_700Bold"],
      },
    },
  },
  plugins: [],
};
