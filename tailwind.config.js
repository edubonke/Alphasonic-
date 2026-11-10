/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./services.html",
    "./portfolio.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./public/**/*.html"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Original Alphasonic brand colors
        "navy-950": "#031a3b",
        "navy-900": "#052656",
        "brand-blue": "#0861be",
        "brand-blue-light": "#10a8e8",
        "brand-green": "#55d714",
        "brand-green-deep": "#187a12",
        "ink": "#13213a",
        "muted": "#64748b",
        "line": "#dbe5ef",
        "soft": "#f5f8fb",

        // Mapped to layout token semantic aliases
        primary: "#031a3b",
        "primary-container": "#052656",
        "on-primary": "#ffffff",
        "on-primary-container": "#dbe5ef",
        
        secondary: "#0861be",
        "secondary-container": "#10a8e8",
        "secondary-fixed": "#e0f2fe",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#031a3b",
        
        accent: "#55d714",
        "accent-dark": "#187a12",

        background: "#f5f8fb",
        surface: "#ffffff",
        "surface-container": "#f0f4f9",
        "surface-container-low": "#f8fafc",
        "surface-container-high": "#e2e8f0",
        "surface-container-highest": "#cbd5e1",
        "surface-container-lowest": "#ffffff",
        
        "on-surface": "#13213a",
        "on-surface-variant": "#64748b",
        outline: "#94a3b8",
        "outline-variant": "#dbe5ef"
      },
      fontFamily: {
        headline: ["Space Grotesk", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        "display-hero": ["Space Grotesk", "sans-serif"],
        "display-hero-mobile": ["Space Grotesk", "sans-serif"],
        "headline-xl": ["Space Grotesk", "sans-serif"],
        "headline-xl-mobile": ["Space Grotesk", "sans-serif"],
        "headline-lg": ["Space Grotesk", "sans-serif"],
        "headline-lg-mobile": ["Space Grotesk", "sans-serif"],
        "headline-md": ["Space Grotesk", "sans-serif"],
        "headline-sm": ["Space Grotesk", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-sm": ["Plus Jakarta Sans", "sans-serif"],
        "label-eyebrow": ["Plus Jakarta Sans", "sans-serif"],
        "label-ui": ["Plus Jakarta Sans", "sans-serif"],
        "label-code": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "space-2xl": "4rem",
        gutter: "1.5rem",
        "gutter-sm": "1rem",
        "gutter-lg": "2.5rem",
        margin: "1.5rem",
        "margin-md": "3rem",
        "margin-lg": "5rem"
      }
    }
  },
  plugins: []
};
