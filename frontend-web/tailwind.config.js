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
        // ===== WARNA YANG SUDAH ADA =====
        'pastel-blue': {
          50: '#F0F7FF',
          100: '#D6E8FF',
          200: '#B3D9FF',
          300: '#8FC9FF',
          400: '#6ABAFF',
          500: '#4A9AE6',
          600: '#3A7AB8',
        },
        'soft-white': '#FAFCFE',

        navy: '#112250',
        sapphire: '#3B507D',
        'warm-taupe': '#BEB7A7',
        champagne: '#E7E2CE',
        ivory: '#F5F4F0',

        // ===== WINTER BLUE PALETTE (BARU) =====
        // Moonlight #F0ECDD
        moonlight: {
          DEFAULT: '#F0ECDD',
          50: '#FDFCF8',
          100: '#F0ECDD',
          200: '#E5DFC9',
          300: '#D8D0B4',
          400: '#C5BA97',
        },

        // Frost Blue #8BA3C5
        'frost-blue': {
          DEFAULT: '#8BA3C5',
          50: '#F3F6FA',
          100: '#E1E9F3',
          200: '#C6D5E6',
          300: '#A9BED8',
          400: '#8BA3C5',
          500: '#6B88B0',
          600: '#4F6A94',
          700: '#3D5375',
        },

        // Steel #495B7D
        steel: {
          DEFAULT: '#495B7D',
          50: '#EEF1F6',
          100: '#D5DCE7',
          200: '#AAB8CC',
          300: '#7F93AF',
          400: '#5F7392',
          500: '#495B7D',
          600: '#3A4965',
          700: '#2C384D',
        },

        // Storm #23354D
        storm: {
          DEFAULT: '#23354D',
          50: '#E8ECF2',
          100: '#C7D0DE',
          200: '#8FA0BD',
          300: '#5A7097',
          400: '#3D4F70',
          500: '#23354D',
          600: '#1B2A3D',
          700: '#131E2C',
        },

        // Oxford Blue #02122F
        'oxford-blue': {
          DEFAULT: '#02122F',
          50: '#E6E9F0',
          100: '#BFC7D9',
          200: '#8A96B3',
          300: '#55658C',
          400: '#2A3B62',
          500: '#02122F',
          600: '#020E25',
          700: '#010A1B',
        },
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'slide-in': 'slideIn 0.8s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};