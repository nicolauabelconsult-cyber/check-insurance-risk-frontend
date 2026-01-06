/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif","system-ui","-apple-system","Segoe UI","Roboto","Helvetica","Arial","Apple Color Emoji","Segoe UI Emoji"]
      },
      boxShadow: {
        hairline: "0 0 0 1px rgba(255,255,255,0.06)",
        subtle: "0 12px 40px rgba(0,0,0,0.45)"
      }
    },
  },
  plugins: [],
};
