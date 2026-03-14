/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        xs: "375px",
        tablet: "820px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Дополнительные цвета для дизайн-системы (будут добавлены из Figma)
        brand: {
          50: "hsl(var(--brand-50))",
          100: "hsl(var(--brand-100))",
          200: "hsl(var(--brand-200))",
          300: "hsl(var(--brand-300))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
          700: "hsl(var(--brand-700))",
          800: "hsl(var(--brand-800))",
          900: "hsl(var(--brand-900))",
        },
        // === ДИЗАЙН-СИСТЕМА УНИДЕНТ (из Figma) ===
        // Используйте эти цвета вместо хардкода для единообразия
        unident: {
          // Основные цвета
          primary: '#526AC2',           // Основной синий (кнопки, бейджи, ссылки)
          primaryLight: '#607BD4',      // Светлый синий (hover состояния)
          dark: '#191E35',              // Темный текст (основной текст)
          white: '#FFFFFF',             // Белый
          
          // Цвета фонов
          bgLightBlue: '#D9E4F7',       // Светлый голубой (бейдж рейтинга)
          bgLightGray: '#EEF3F9',       // Светлый серый (бейдж стажа)
          bgTopbar: '#F9F9F9',          // Фон топбара
          bgElements: '#F5F7F9',        // Фон элементов (поиск, иконки)
          footer: '#2F375F',            // Цвет футера
          
          // Цвета границ
          borderGray: '#D8D8D8',        // Серая рамка карточек
          
          // Цвета текста
          textGray: '#8F8F8F',          // Серый текст (вторичный)
          
          // Градиенты для социальных иконок (из Figma)
          socialGradientStart: '#2E365D', // Начало градиента
          socialGradientEnd: '#46559D',   // Конец градиента
        },
      },
      fontFamily: {
        // === ШРИФТЫ ===
        // Gilroy — локальный шрифт (next/font/local в layout.tsx)
        // 5 начертаний: Light, Regular, Medium, SemiBold, Bold
        sans: ['var(--font-gilroy)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        montserrat: ['var(--font-gilroy)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        gilroy: ['var(--font-gilroy)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        // Кастомные отступы из дизайн-системы
        18: '4.5rem',
        88: '22rem',
        100: '25rem',
        112: '28rem',
        128: '32rem',
      },
      fontSize: {
        // Типографика из дизайн-системы
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['2rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.5rem', { lineHeight: '3rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("@tailwindcss/container-queries"),
    require("tailwindcss-animate"),
  ],
  // Hover-состояния для SocialLinks в футере (hoverInvert) — не вырезать при purge
  safelist: [
    "hover:!bg-unident-primary",
    "group-hover:!text-white",
  ],
}

