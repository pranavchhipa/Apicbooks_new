import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Midnight Library palette
                midnight: {
                    DEFAULT: '#0A0A0F',
                    50: '#18181F',
                    100: '#141419',
                    200: '#1E1E26',
                    300: '#282833',
                    400: '#35354A',
                    500: '#4A4A6A',
                },
                surface: {
                    DEFAULT: '#141419',
                    light: '#1A1A22',
                    lighter: '#22222D',
                    border: 'rgba(255,255,255,0.06)',
                },
                amber: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#F5A623',
                    600: '#D97706',
                    700: '#B45309',
                    800: '#92400E',
                    900: '#78350F',
                },
                violet: {
                    50: '#F5F3FF',
                    100: '#EDE9FE',
                    200: '#DDD6FE',
                    300: '#C4B5FD',
                    400: '#A78BFA',
                    500: '#8B5CF6',
                    600: '#7C3AED',
                    700: '#6D28D9',
                    800: '#5B21B6',
                    900: '#4C1D95',
                },
                emerald: {
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                },
                rose: {
                    400: '#FB7185',
                    500: '#F43F5E',
                },
                // Semantic tokens
                foreground: '#FFFFFF',
                'foreground-muted': 'rgba(255,255,255,0.5)',
                'foreground-subtle': 'rgba(255,255,255,0.3)',
            },
            fontFamily: {
                sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
                display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
                serif: ['var(--font-instrument)', 'Georgia', 'serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glow-amber': 'radial-gradient(ellipse at center, rgba(245,166,35,0.15) 0%, transparent 70%)',
                'glow-violet': 'radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)',
                'glow-mixed': 'radial-gradient(ellipse at 30% 50%, rgba(245,166,35,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.06) 0%, transparent 50%)',
                'hero-mesh': 'radial-gradient(ellipse at 20% 0%, rgba(245,166,35,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 0%, rgba(139,92,246,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(245,166,35,0.05) 0%, transparent 50%)',
                'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
                'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'fade-up': 'fadeUp 0.7s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'slide-in-left': 'slideInLeft 0.5s ease-out',
                'slide-in-right': 'slideInRight 0.5s ease-out',
                'glow-pulse': 'glowPulse 4s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'marquee': 'marquee 80s linear infinite',
                'marquee-reverse': 'marqueeReverse 80s linear infinite',
                'spin-slow': 'spin 20s linear infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'gradient-shift': 'gradientShift 8s ease infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-30px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(30px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                glowPulse: {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '0.8' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                marqueeReverse: {
                    '0%': { transform: 'translateX(-50%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            boxShadow: {
                'glow-sm': '0 0 15px -3px rgba(245,166,35,0.15)',
                'glow-md': '0 0 30px -5px rgba(245,166,35,0.2)',
                'glow-lg': '0 0 60px -10px rgba(245,166,35,0.25)',
                'glow-violet': '0 0 30px -5px rgba(139,92,246,0.2)',
                'glass': '0 8px 32px rgba(0,0,0,0.3)',
                'glass-lg': '0 25px 60px -12px rgba(0,0,0,0.5)',
                'card': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
                'card-hover': '0 20px 40px -12px rgba(0,0,0,0.5), 0 0 20px -5px rgba(245,166,35,0.1)',
                'book': '4px 4px 20px rgba(0,0,0,0.4)',
                'book-hover': '8px 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(245,166,35,0.1)',
                'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
        },
    },
    plugins: [],
};

export default config;
