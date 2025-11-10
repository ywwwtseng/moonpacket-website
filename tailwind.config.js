/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E32521',
        primaryDark: '#B51C1A',
        primaryLight: '#F14A3F',
        gold: '#FFBA00',
        goldDark: '#CC9500',
        goldLight: '#FFD766',
        navy: '#0C1E3A',
        navyDark: '#081427',
        navyLight: '#38517A',
        bgDark: '#0B0B0D',
        bgLight: '#F7F7FB',
        text: '#101114',
        textSubtle: '#6A6F76'
      },
      fontFamily: {
        // Default body font: Inter
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Brand / headings: Sora first
        brand: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        // Numeric system: IBM Plex Sans first (OFL). Binance fonts NOT included by policy
        num: ['IBM Plex Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    }
  }
};


