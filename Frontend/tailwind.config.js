module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        zoomFadeIn: {
          '0%': { transform: 'scale(1.1)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        rotateIn: {
          '0%': { transform: 'perspective(1000px) rotateY(-10deg)', opacity: '0' },
          '100%': { transform: 'perspective(1000px) rotateY(0)', opacity: '1' },
        },
        expandIn: {
          '0%': { transform: 'scale(0.95) translateY(-10px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0)', opacity: '1' },
        }
      },
      animation: {
        slideIn: 'slideIn 0.5s ease-out',
        fadeIn: 'fadeIn 0.5s ease-out',
        scaleIn: 'scaleIn 0.5s ease-out',
        slideRight: 'slideRight 0.5s ease-out',
        bounce: 'bounce 2s infinite',
        zoomFadeIn: 'zoomFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        rotateIn: 'rotateIn 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        expandIn: 'expandIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        cardFlip: 'cardFlip 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: [],
};
