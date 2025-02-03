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
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }
    },
  },
  plugins: [],
}