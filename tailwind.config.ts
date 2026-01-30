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
                // New Design System - Electric Indigo + Vibrant Cyan
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1', // Electric Indigo - Main
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                accent: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4', // Vibrant Cyan - Main
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63',
                    950: '#083344',
                },

                success: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981', // Emerald
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                    950: '#022c22',
                },
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b', // Amber
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    950: '#451a03',
                },
                // Backgrounds and Foreground
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                'muted-foreground': 'var(--foreground-muted)',

                // Card & Surface
                card: 'var(--card-bg)',
                'card-border': 'var(--card-border)',
                surface: 'var(--surface)',
                elevated: 'var(--elevated)',

                // Semantic Colors (using variables)
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                    // Legacy palette support (was same as primary)
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },

                // Keep original palette for reference/fallback if needed
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, #0a0e27 0%, #141b3d 50%, #1e2749 100%)',
                'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(99, 102, 241, 0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(6, 182, 212, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(99, 102, 241, 0.1) 0px, transparent 50%)',
                'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                'gradient-accent': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                'gradient-mixed': 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'slide-in-left': 'slideInLeft 0.5s ease-out',
                'slide-in-right': 'slideInRight 0.5s ease-out',
                'pulse-slow': 'pulse 3s infinite',
                'shimmer': 'shimmer 2s infinite',
                'float': 'float 20s ease-in-out infinite',
                'float-delayed': 'floatDelayed 20s ease-in-out infinite',
                'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'spin-slow': 'spin 8s linear infinite',
                'gradient': 'gradientShift 3s ease infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
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
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '25%': { transform: 'translate(30px, -40px) scale(1.05)' },
                    '50%': { transform: 'translate(-20px, 20px) scale(0.95)' },
                    '75%': { transform: 'translate(40px, 30px) scale(1.02)' },
                },
                floatDelayed: {
                    '0%, 100%': { transform: 'translate(0, 0)' },
                    '50%': { transform: 'translate(-30px, 30px)' },
                },
                bounceGentle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)' },
                },
                gradientShift: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(10, 14, 39, 0.37)',
                'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
                'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
                'glow-accent': '0 0 20px rgba(6, 182, 212, 0.3)',
                'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
                'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
            },
            transitionDuration: {
                '400': '400ms',
            },
            backdropBlur: {
                'xs': '2px',
                'xl': '40px',
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '26': '6.5rem',
                '30': '7.5rem',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
        },
    },
    plugins: [],
};

export default config;
