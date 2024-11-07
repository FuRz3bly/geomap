/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#57b378",
          hidden: "#94A3B8",
          bright: "#42e3a8",
          dark: "#2a3b30",
          disabled: "#6bb084",
          5: "#d9ffe6",
          10: "#bfffd6",
          50: "#86ebaa",
          75: "#7cd99d",
          85: "#6fc78f",
          100: "#3b8a57",
          125: "#3e664c",
          200: "#193b25",
          300: "#0f2b19",
        },
        highlight: {
          DEFAULT: "#FDFFAE",
          20: "#fffd99"
        },
        secondary: {
          DEFAULT: "#00B0F0",
          100: "",
          200: "",
        },
        error: {
          DEFAULT: "#de4e55"
        },
        warn: {
          DEFAULT: "#ff845c",
          50: "#ffc484",
          100: "#ffaa71"
        },
        missing: {
          DEFAULT: '#ebd95e',
          100: '#FFCC00',
          200: '#f09c04'
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
        rthin: ["Roboto-Thin", "sans-serif"],
        rbase: ["Roboto-Regular", "sans-serif"],
        rmedium: ["Roboto-Medium", "sans-serif"],
        rlight: ["Roboto-Light", "sans-serif"],
        rbold: ["Roboto-Bold", "sans-serif"],
        rblack: ["Roboto-Black", "sans-serif"],
        opsemibold: ["OpenSans-SemiBold", "sans-serif"],
        opbase: ["OpenSans-Regular", "sans-serif"],
        opmedium: ["OpenSans-Medium", "sans-serif"],
        oplight: ["OpenSans-Light", "sans-serif"],
        opbold: ["OpenSans-Bold", "sans-serif"],
        opxbold: ["OpenSans-ExtraBold", "sans-serif"],
      },
    },
    screens: {
      'mini': '720px'
    }
  },
  plugins: [],
};