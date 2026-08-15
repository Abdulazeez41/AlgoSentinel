import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#05060A",
        surface: "rgba(255,255,255,0.06)",
        "surface-strong": "rgba(255,255,255,0.10)",
        border: "rgba(255,255,255,0.14)",
        ink: "#F5F7FA",
        muted: "#9AA3B2",
        accent: "#3DD9EB",
        "accent-soft": "rgba(61,217,235,0.16)",
        indigo: "#7C8CFF",
        amber: "#F2B75C",
        violet: "#B48CFF",
      },
      fontFamily: {
        system: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          '"SF Mono"',
          "Menlo",
          '"Roboto Mono"',
          "monospace",
        ],
      },
      borderRadius: {
        glass: "28px",
        "glass-sm": "18px",
      },
      boxShadow: {
        glass: "0 8px 40px rgba(0,0,0,0.45)",
        "glass-inset": "inset 0 1px 0 rgba(255,255,255,0.25)",
      },
      backdropBlur: {
        glass: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
