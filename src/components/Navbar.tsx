'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { label: 'Discover', href: '/discover' },
    { label: 'Clubs', href: '/clubs' },
    { label: 'Features', href: '/features' },
];

export default function Navbar({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled
                ? 'bg-midnight/80 backdrop-blur-xl border-b border-white/[0.04]'
                : 'bg-transparent'
        }`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 md:h-[72px]">
                    <Link href="/" className="flex-shrink-0 group flex items-center gap-2">
                        <img src="/logo-apicbooks.png" alt="ApicBooks" className="h-8 w-8 rounded-md" />
                        <span className="font-display text-xl md:text-[22px] font-extrabold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                            ApicBooks
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    pathname === link.href
                                        ? 'text-amber-400 bg-amber-500/10'
                                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <Link href="/dashboard" className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2 group">
                                Dashboard
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors px-3 py-2">
                                    Sign In
                                </Link>
                                <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2 group">
                                    Get Started
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-midnight/95 backdrop-blur-xl border-b border-white/[0.04] overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                        pathname === link.href
                                            ? 'text-amber-400 bg-amber-500/10'
                                            : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-3 border-t border-white/[0.04] mt-3 space-y-2">
                                {user ? (
                                    <Link href="/dashboard" className="btn-primary w-full text-center py-3 block">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/auth/login" className="block text-center py-3 text-sm font-medium text-white/60 hover:text-white">
                                            Sign In
                                        </Link>
                                        <Link href="/auth/signup" className="btn-primary w-full text-center py-3 block">
                                            Get Started Free
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
