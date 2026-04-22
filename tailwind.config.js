/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#07090d',
        panel: '#11141a',
        inner: '#151a22',
        border: '#27313d',
        bay: '#3a4552',
        accent: '#ef5f4c',
        text: '#f7f8fb',
        muted: '#9da7b5',
        tertiary: '#637083',
        surface: '#121821',
        canvas: '#0d1218',
        ink: '#ffffff',
      },
      fontFamily: {
        sans: ['"Manrope"', 'sans-serif'],
        display: ['"Space Grotesk"', '"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        accent: '0 18px 35px rgba(239, 95, 76, 0.18)',
        card: '0 20px 45px rgba(0, 0, 0, 0.4)',
        white: '0 14px 34px rgba(255, 255, 255, 0.55)',
      },
      backgroundImage: {
        'radial-panel':
          'radial-gradient(circle at top left, rgba(255,255,255,0.08), rgba(255,255,255,0) 52%)',
        'accent-sheen':
          'linear-gradient(135deg, rgba(239,95,76,0.12), rgba(239,95,76,0.02) 46%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
