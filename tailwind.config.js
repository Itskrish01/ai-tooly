/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Display + body lean monospace for the terminal-workstation feel.
        sans: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          '"JetBrains Mono"',
          '"Geist Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
        display: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          1: "#101010",
          2: "#161616",
          3: "#1c1c1c",
          4: "#242424",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.12)",
        },
        fg: {
          DEFAULT: "#ededed",
          dim: "#8a8a8a",
          mute: "#5a5a5a",
        },
        // Lime + amber: terminal-flavored, breaks out of "AI tool blue".
        accent: {
          DEFAULT: "#bef264",
          2: "#a3e635",
          ink: "#0a0a0a",
        },
        warn: "#fbbf24",
        danger: "#f87171",
      },
      boxShadow: {
        ring: "0 0 0 1px rgba(255,255,255,0.06)",
        card: "0 1px 0 rgba(255,255,255,0.03) inset, 0 24px 40px -24px rgba(0,0,0,0.7)",
        glow: "0 0 0 1px rgba(190,242,100,0.20), 0 0 24px -4px rgba(190,242,100,0.25)",
      },
      keyframes: {
        blink: { "0%,49%": { opacity: 1 }, "50%,100%": { opacity: 0 } },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        blink: "blink 1s steps(2, start) infinite",
        scan: "scan 6s linear infinite",
      },
    },
  },
  plugins: [],
};
