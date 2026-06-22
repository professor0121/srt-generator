/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#15161A',
        panel: '#1F2127',
        panel2: '#262830',
        line: '#34373F',
        paper: '#EBE6DD',
        muted: '#9A9690',
        amber: '#F2A53C',
        teal: '#5B8C7B',
        rose: '#E0524A',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(242,165,60,0.4), 0 0 24px rgba(242,165,60,0.15)',
      },
    },
  },
  plugins: [],
};
