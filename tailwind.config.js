/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', '"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "#07080a",
          1: "#0b0d10",
          2: "#111418",
          3: "#161a20",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.14)",
        },
        fg: {
          DEFAULT: "#e7e9ee",
          dim: "#9aa1ac",
          mute: "#6b7280",
        },
        accent: {
          DEFAULT: "#5b8cff",
          2: "#7c5cff",
        },
      },
      boxShadow: {
        ring: "0 0 0 1px rgba(255,255,255,0.08)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 30px -12px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
