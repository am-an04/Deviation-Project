/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        qms: {
          primary: "#174A7E",
          dark: "#123A63",
          bg: "#F5F7FA",
          card: "#FFFFFF",
          text: "#17212B",
          secondary: "#5B6875",
          muted: "#8A96A3",
          border: "#DCE2E8",
          input: "#CBD4DD",
          ai: "#2F6FED",
          aiLight: "#EEF4FF",
          success: "#247A45",
          warning: "#A15C00",
          error: "#B42318",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: "8px",
        input: "6px",
        btn: "6px",
        badge: "12px",
      }
    },
  },
  plugins: [],
}
