/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B5E3B',
          hover: '#164A30',
          light: '#E8F5EE',
        },
        accent: {
          DEFAULT: '#C75B2A',
          light: '#FEF0E8',
        },
        surface: '#FFFFFF',
        bg: {
          DEFAULT: '#F6F5F1',
          alt: '#EDECEA',
        },
        text: {
          DEFAULT: '#1A1A1A',
          secondary: '#5C5C5C',
          muted: '#8A8A8A',
        },
        border: {
          DEFAULT: '#DDD9D4',
          light: '#ECEAE7',
        },
        success: '#1B7A3D',
        danger: '#C23B22',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.5px' }],
        'h1': ['36px', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.3px' }],
        'h2': ['28px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.2px' }],
        'h3': ['22px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.1px' }],
        'h4': ['18px', { lineHeight: '1.35', fontWeight: '600' }],
        'body-base': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.65', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0.1px' }],
        'overline': ['12px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '1px' }],
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'sm': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'md': '0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        'lg': '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)',
        'xl': '0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      maxWidth: {
        'content': '720px',
        'prose': '680px',
      },
    },
  },
  plugins: [],
}
