/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        "strong": "12px 12px 0px rgba(0, 0, 0, 1)", // 12px offset, 0 blur, 100% opacity
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'pop': 'pop 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0)' },
          '80%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        }
      },
    },
  },
  plugins: [],
};