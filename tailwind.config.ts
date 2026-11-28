import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: "#151311",
          surface: "#181614",
          elevated: "#1c1917",
          sunken: "#100e0d",
          dark: "#0a0908",
          light: "#24201d",
          rim: "rgba(255, 255, 255, 0.04)",
        },
      },
      boxShadow: {
        'neu-flat': '6px 6px 14px rgba(0, 0, 0, 0.65), -5px -5px 12px rgba(255, 255, 255, 0.04)',
        'neu-flat-sm': '3px 3px 8px rgba(0, 0, 0, 0.6), -3px -3px 7px rgba(255, 255, 255, 0.04)',
        'neu-flat-lg': '9px 9px 20px rgba(0, 0, 0, 0.75), -7px -7px 16px rgba(255, 255, 255, 0.04)',
        'neu-pressed': 'inset 4px 4px 8px rgba(0, 0, 0, 0.7), inset -3px -3px 7px rgba(255, 255, 255, 0.03)',
        'neu-pressed-sm': 'inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 4px rgba(255, 255, 255, 0.03)',
        'neu-orange': '5px 5px 14px rgba(0, 0, 0, 0.6), -3px -3px 8px rgba(255, 255, 255, 0.12), 0 0 16px rgba(249, 115, 22, 0.35)',
        'neu-green': '5px 5px 14px rgba(0, 0, 0, 0.6), -3px -3px 8px rgba(255, 255, 255, 0.12), 0 0 16px rgba(16, 185, 129, 0.35)',
        'neu-amber': '5px 5px 14px rgba(0, 0, 0, 0.6), -3px -3px 8px rgba(255, 255, 255, 0.12), 0 0 16px rgba(245, 158, 11, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
