/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#57b378",
          50: "#86ebaa",
          75: "#7cd99d",
          85: "#6fc78f",
          100: "#3b8a57"
        },
        secondary: {
          DEFAULT: "#FDFFAE",
          100: "#42e3a8",
          200: "#fffd99",
        },
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
        gray: {
          100: "#CDCDE0",
        },
        white: {
          DEFAULT: "#fff",
          100: "#a3a3a3",
          200: "#9c9c9c",
          500: "#616161",
          red: "#fff5f2",
        },
        fire: {
          DEFAULT: "#ff6426",
          100: "#ff7a45",
        },
        police: {
          DEFAULT: "#676eeb",
          10: "#202691",
          25: "#676eeb",
          50: "#434ad1",
          100: "#222678"
        },
        drrmo: {
          DEFAULT: "#478a3f",
          10: "#68d65c",
          25: "#9fff94",
          100: "#50bf43",
          200: "#478a3f"
        }
      },
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],
      },
    },
  },
  plugins: [],
};