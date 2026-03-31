'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/* ─── Owl + Book SVG Icon ─── */
export function OwlIcon({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Book base */}
            <path d="M12 44 L32 50 L52 44 L52 48 L32 54 L12 48 Z" fill="url(#bookGrad)" opacity="0.7" />
            <path d="M12 40 L32 46 L52 40 L52 44 L32 50 L12 44 Z" fill="url(#bookGrad)" opacity="0.85" />
            <path d="M12 36 L32 42 L52 36 L52 40 L32 46 L12 40 Z" fill="url(#bookGrad)" />

            {/* Owl body */}
            <ellipse cx="32" cy="24" rx="16" ry="18" fill="url(#bodyGrad)" />

            {/* Inner chest pattern */}
            <ellipse cx="32" cy="28" rx="9" ry="10" fill="url(#chestGrad)" opacity="0.4" />

            {/* Left eye socket */}
            <circle cx="25" cy="20" r="7" fill="url(#eyeSocketGrad)" />
            {/* Right eye socket */}
            <circle cx="39" cy="20" r="7" fill="url(#eyeSocketGrad)" />

            {/* Left eye */}
            <circle cx="25" cy="20" r="4.5" fill="#fef3c7" />
            <circle cx="25" cy="20" r="2.5" fill="#f59e0b" />
            <circle cx="25" cy="19.5" r="1.2" fill="#92400e" />
            <circle cx="24" cy="18.5" r="0.6" fill="white" />

            {/* Right eye */}
            <circle cx="39" cy="20" r="4.5" fill="#fef3c7" />
            <circle cx="39" cy="20" r="2.5" fill="#f59e0b" />
            <circle cx="39" cy="19.5" r="1.2" fill="#92400e" />
            <circle cx="38" cy="18.5" r="0.6" fill="white" />

            {/* Beak */}
            <path d="M30 24 L32 28 L34 24 Z" fill="#f0a45d" />

            {/* Ear tufts */}
            <path d="M20 10 L22 7 L25 12 Z" fill="url(#tuftGrad)" />
            <path d="M44 10 L42 7 L39 12 Z" fill="url(#tuftGrad)" />

            {/* Wing hints */}
            <path d="M16 20 Q12 28 16 34" stroke="url(#wingGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M48 20 Q52 28 48 34" stroke="url(#wingGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Gradients */}
            <defs>
                <linearGradient id="bodyGrad" x1="16" y1="6" x2="48" y2="42" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#9b7aff" />
                    <stop offset="100%" stopColor="#6d4acd" />
                </linearGradient>
                <linearGradient id="chestGrad" x1="23" y1="18" x2="41" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#ddd6fe" />
                </linearGradient>
                <linearGradient id="eyeSocketGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e1145" />
                    <stop offset="100%" stopColor="#2d1b69" />
                </linearGradient>
                <linearGradient id="bookGrad" x1="12" y1="36" x2="52" y2="54" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f0a45d" />
                    <stop offset="100%" stopColor="#e8914f" />
                </linearGradient>
                <linearGradient id="tuftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#7c5cfc" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ─── Full Logo: Icon + Wordmark ─── */
export default function Logo({ className = "w-56" }: { className?: string }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const textColor = mounted && resolvedTheme === 'dark' ? '#f5f0eb' : '#2c1810';
    const subtitleColor = mounted && resolvedTheme === 'dark' ? '#a39484' : '#8b7355';

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <OwlIcon className="w-10 h-10 flex-shrink-0" />
            <div className="flex flex-col leading-tight">
                <span
                    className="text-xl font-display font-bold tracking-tight transition-colors duration-300"
                    style={{ color: textColor }}
                >
                    ApicBooks
                </span>
                <span
                    className="text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-300"
                    style={{ color: subtitleColor }}
                >
                    Read Smarter
                </span>
            </div>
        </div>
    );
}

/* ─── Compact icon-only logo ─── */
export function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
    return <OwlIcon className={className} />;
}

export function FlameIcon({ className = "w-6 h-6", animated = true }: { className?: string; animated?: boolean }) {
    return (
        <svg viewBox="0 0 24 24" className={`${className} ${animated ? 'animate-bounce-gentle' : ''}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
            </defs>
            <path
                d="M12 2C12 2 8 6 8 10C8 12.5 9.5 14 12 14C14.5 14 16 12.5 16 10C16 6 12 2 12 2ZM12 20C8.5 20 6 17.5 6 14C6 10 12 4 12 4C12 4 18 10 18 14C18 17.5 15.5 20 12 20Z"
                fill="url(#flameGradient)"
            />
            <path
                d="M12 16C10.5 16 9.5 15 9.5 13.5C9.5 12 12 10 12 10C12 10 14.5 12 14.5 13.5C14.5 15 13.5 16 12 16Z"
                fill="#fbbf24"
            />
        </svg>
    );
}
