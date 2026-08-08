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

        // ===== PALET DARI GAMBAR (TAMBAHKAN INI) =====
        navy: '#112250',
        sapphire: '#3B507D',
        'warm-taupe': '#BEB7A7',
        champagne: '#E7E2CE',
        ivory: '#F5F4F0',
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