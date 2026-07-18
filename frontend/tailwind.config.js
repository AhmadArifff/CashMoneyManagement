/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#101A17',
        inksoft: '#4B5A55',
        paper: '#F4F7F5',
        surface: '#FFFFFF',
        line: '#E3E9E5',
        teal: {
          50: '#EEF7F4',
          100: '#D7ECE4',
          200: '#AEDACB',
          300: '#7EC2AC',
          400: '#4FA88E',
          500: '#2E8B72',
          600: '#1F6F5C',
          700: '#16594A',
          800: '#124A3E',
          900: '#0E3B32'
        },
        rust: {
          50: '#FBEEE9',
          100: '#F5D3C4',
          200: '#EBA98A',
          300: '#DE7D55',
          400: '#CE5A32',
          500: '#B8471F',
          600: '#973A19',
          700: '#742C13'
        },
        amber: {
          50: '#FFF8E8',
          100: '#FCE9BB',
          200: '#F7D791',
          300: '#F4C563',
          400: '#EDAE34',
          500: '#DE9518',
          600: '#B87511'
        }
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,26,23,0.04), 0 8px 24px -12px rgba(16,26,23,0.12)',
      }
    }
  },
  plugins: [],
};
