module.exports = {
  darkMode: 'class', // Class-based dark mode aktif
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Özel renkler ekleyebilirsiniz
        primary: {
          DEFAULT: '#2563eb', // Örnek mavi tonu
          dark: '#1d4ed8'
        },
        premium: {
          DEFAULT: '#1A365D',
          light: '#2A4365',
          dark: '#12243A'
        },
        luxury: '#C5A47E'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        slideUp:
        {
          '0%': { transform: 'translateY(20px)' },
          '100%': { transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}