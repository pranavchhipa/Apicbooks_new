'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

/* ─── Tiny owl mascot gripping the page corner ─── */
function PageGripOwl() {
    return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
            {/* Body */}
            <ellipse cx="40" cy="40" rx="20" ry="22" fill="url(#owlGripBody)" />
            {/* Chest */}
            <ellipse cx="40" cy="44" rx="11" ry="12" fill="#c4b5fd" opacity="0.3" />
            {/* Left eye socket */}
            <circle cx="32" cy="34" r="9" fill="#1e1145" />
            {/* Right eye socket */}
            <circle cx="48" cy="34" r="9" fill="#1e1145" />
            {/* Left eye white */}
            <circle cx="32" cy="34" r="5.5" fill="#fef3c7" />
            <circle cx="32" cy="34" r="3.2" fill="#f59e0b" />
            <circle cx="32.5" cy="33" r="1.5" fill="#92400e" />
            <circle cx="31" cy="31.5" r="0.8" fill="white" />
            {/* Right eye white */}
            <circle cx="48" cy="34" r="5.5" fill="#fef3c7" />
            <circle cx="48" cy="34" r="3.2" fill="#f59e0b" />
            <circle cx="48.5" cy="33" r="1.5" fill="#92400e" />
            <circle cx="47" cy="31.5" r="0.8" fill="white" />
            {/* Beak */}
            <path d="M37 39 L40 44 L43 39 Z" fill="#f0a45d" />
            {/* Ear tufts */}
            <path d="M24 20 L27 14 L31 23 Z" fill="#c084fc" />
            <path d="M56 20 L53 14 L49 23 Z" fill="#c084fc" />
            {/* Left wing reaching down to "grip" the page corner */}
            <path d="M20 48 Q14 56 10 64 Q12 62 16 56 Q18 52 22 50 Z" fill="#9b7aff" stroke="#7c5cfc" strokeWidth="0.8" />
            {/* Tiny claws */}
            <circle cx="10" cy="64" r="1.5" fill="#f0a45d" />
            <circle cx="12" cy="62.5" r="1.2" fill="#f0a45d" />
            {/* Right wing relaxed */}
            <path d="M58 44 Q62 48 60 52 Q58 48 56 46 Z" fill="#9b7aff" opacity="0.5" />
            <defs>
                <linearGradient id="owlGripBody" x1="20" y1="18" x2="60" y2="62" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#9b7aff" />
                    <stop offset="100%" stopColor="#6d4acd" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animatingFromDark, setAnimatingFromDark] = useState(false);
    const themeChangedRef = useRef(false);
    const animatingRef = useRef(false);
    const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => setMounted(true), []);

    // Safety net: if animation gets stuck, auto-reset after 3 seconds
    useEffect(() => {
        if (isAnimating) {
            safetyTimerRef.current = setTimeout(() => {
                setIsAnimating(false);
                animatingRef.current = false;
            }, 3000);
        } else {
            if (safetyTimerRef.current) {
                clearTimeout(safetyTimerRef.current);
                safetyTimerRef.current = null;
            }
        }
        return () => {
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        };
    }, [isAnimating]);

    if (!mounted) {
        return <div className="w-10 h-10 rounded-xl bg-[#241e36] animate-pulse" />;
    }

    const isDark = resolvedTheme === 'dark';

    const handleToggle = () => {
        if (isAnimating || animatingRef.current) return;
        animatingRef.current = true;
        setAnimatingFromDark(isDark);
        themeChangedRef.current = false;
        setIsAnimating(true);
    };

    // Handle the flip reaching 90° — theme switches here
    const handleAnimationUpdate = (latest: any) => {
        if (!themeChangedRef.current && latest.rotateY !== undefined) {
            const angle = Math.abs(parseFloat(latest.rotateY));
            if (angle >= 88) {
                themeChangedRef.current = true;
                setTheme(animatingFromDark ? 'light' : 'dark');
            }
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={handleToggle}
                disabled={isAnimating}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-[#241e36]/80 hover:bg-[#2d2545] text-amber-400 border border-[#2d2545]/60 disabled:cursor-not-allowed"
                aria-label="Toggle theme"
            >
                <AnimatePresence mode="wait">
                    {isDark ? (
                        <motion.div
                            key="moon"
                            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Moon className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Sun className="w-5 h-5 text-amber-500" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>

            {/* ── Page Turn Overlay ── portalled to body, z-45 stays below sidebar z-50 */}
            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {isAnimating && (
                            <motion.div
                                className="fixed inset-0 pointer-events-none overflow-hidden"
                                style={{ zIndex: 45, perspective: '2500px', perspectiveOrigin: '0% 50%' }}
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* ── The page ── */}
                                <motion.div
                                    className="absolute inset-0"
                                    style={{
                                        transformOrigin: '0% 50%',
                                        transformStyle: 'preserve-3d',
                                    }}
                                    initial={{ rotateY: 0 }}
                                    animate={{ rotateY: -180 }}
                                    transition={{
                                        duration: 1.6,
                                        ease: [0.4, 0.0, 0.2, 1],
                                    }}
                                    onUpdate={handleAnimationUpdate}
                                    onAnimationComplete={() => {
                                        setIsAnimating(false);
                                        animatingRef.current = false;
                                    }}
                                >
                                    {/* Front — SOLID opaque, previous theme */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: animatingFromDark
                                                ? '#0c0a14'
                                                : '#faf8f5',
                                            backfaceVisibility: 'hidden',
                                        }}
                                    >
                                        {/* Subtle diagonal gradient for depth */}
                                        <div className="absolute inset-0" style={{
                                            background: animatingFromDark
                                                ? 'linear-gradient(145deg, rgba(22,18,34,0.6) 0%, transparent 60%)'
                                                : 'linear-gradient(145deg, rgba(243,239,232,0.8) 0%, transparent 60%)',
                                        }} />
                                    </div>

                                    {/* Back — SOLID opaque, new theme */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: animatingFromDark
                                                ? '#faf8f5'
                                                : '#0c0a14',
                                            transform: 'rotateY(180deg)',
                                            backfaceVisibility: 'hidden',
                                        }}
                                    >
                                        <div className="absolute inset-0" style={{
                                            background: animatingFromDark
                                                ? 'linear-gradient(215deg, rgba(243,239,232,0.8) 0%, transparent 60%)'
                                                : 'linear-gradient(215deg, rgba(22,18,34,0.6) 0%, transparent 60%)',
                                        }} />
                                    </div>
                                </motion.div>

                                {/* ── Fold shadow / crease line ── */}
                                <motion.div
                                    className="absolute top-0 bottom-0"
                                    style={{
                                        width: '80px',
                                        background: 'linear-gradient(to left, transparent, rgba(0,0,0,0.06) 20%, rgba(0,0,0,0.14) 50%, rgba(0,0,0,0.06) 80%, transparent)',
                                    }}
                                    initial={{ left: '100%' }}
                                    animate={{ left: '-80px' }}
                                    transition={{
                                        duration: 1.6,
                                        ease: [0.4, 0.0, 0.2, 1],
                                    }}
                                />

                                {/* ── Owl mascot pulling the corner ── */}
                                <motion.div
                                    className="absolute"
                                    style={{ top: '4%', right: '2%' }}
                                    initial={{ x: 0, rotate: 5, opacity: 0, scale: 0.6 }}
                                    animate={{
                                        x: [0, -40, -150, -400, -800],
                                        rotate: [5, 0, -10, -20, -30],
                                        opacity: [0, 1, 1, 1, 0],
                                        scale: [0.6, 1, 1.05, 1, 0.9],
                                    }}
                                    transition={{
                                        duration: 1.6,
                                        ease: [0.4, 0.0, 0.2, 1],
                                        opacity: { times: [0, 0.05, 0.4, 0.85, 1] },
                                    }}
                                >
                                    <PageGripOwl />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </>
    );
}
