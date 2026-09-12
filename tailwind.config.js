/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',

        // Cultiveq Weather Palette
        'off-white': '#F7F8F3',
        'navy-deep': '#101226',
        'secondary-bg': '#EEF2EA',
        'secondary-text': '#66706A',
        'green-main': '#123F2B',
        'green-deep': '#0B2F20',
        'green-soft': '#DDE9DF',
        'green-card': '#1E4D37',
        'rain-accent': '#6FA8C9',
        'sunny-accent': '#E7B85C',
        'warning-accent': '#D89A4A',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '32px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
