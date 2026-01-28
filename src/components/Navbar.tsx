'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, Menu, X, LogOut, Layers, MessageSquare, Tag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

interface NavbarProps {
    user?: { email: string } | null;
    onLogout?: () => void;
}

const navLinks = [
    { href: '#features', label: 'Features', icon: Layers },
    { href: '#community', label: 'Community', icon: MessageSquare },
];

export default function Navbar({ user, onLogout }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setIsMenuOpen(false);
            }
        }
    };

    return (
        <nav className={`
            sticky top-0 z-50 transition-all duration-300
            ${isScrolled
                ? 'bg-[#0a0e27]/90 backdrop-blur-xl border-b border-[#1e2749] shadow-lg'
                : 'bg-transparent border-b border-transparent'
            }
        `}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center py-0">
                        <Logo className="w-56 md:w-72 h-auto object-contain" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={(e) => scrollToSection(e, link.href)}
                                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1e2749]/50 font-medium transition-all duration-300"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="w-px h-6 bg-[#1e2749] mx-4" />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 font-medium transition-all"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={onLogout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#1e2749] text-slate-400 hover:text-white transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/auth/login"
                                    className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-[#1e2749] text-slate-300 transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div className={`
                    md:hidden overflow-hidden transition-all duration-300
                    ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}>
                    <div className="py-4 border-t border-[#1e2749] space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={(e) => scrollToSection(e, link.href)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-[#1e2749]/50 transition-colors"
                            >
                                {link.icon && <link.icon className="w-4 h-4" />}
                                {link.label}
                            </Link>
                        ))}

                        <div className="my-2 border-t border-[#1e2749]" />

                        {user ? (
                            <div className="space-y-2 px-4">
                                <div className="flex items-center gap-2 py-2 text-slate-400">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm truncate">{user.email}</span>
                                </div>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-primary-500 text-white font-medium"
                                >
                                    Go to Dashboard
                                </Link>
                                <button
                                    onClick={() => { onLogout?.(); setIsMenuOpen(false); }}
                                    className="flex items-center justify-center w-full gap-2 px-4 py-3 rounded-xl hover:bg-[#1e2749] text-slate-400 hover:text-white"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 p-4">
                                <Link
                                    href="/auth/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full py-3 text-center rounded-xl bg-[#1e2749] text-white font-medium"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full py-3 text-center btn-gradient rounded-xl font-medium"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
