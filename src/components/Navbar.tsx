'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, Menu, X, LogOut, Layers, MessageSquare, Tag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
    user?: { email?: string } | null;
}

const navLinks = [
    { href: '#features', label: 'Features', icon: Layers },
    { href: '/pricing', label: 'Pricing', icon: Tag },
    { href: '#community', label: 'Community', icon: MessageSquare },
];

export default function Navbar({ user }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

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
                ? 'bg-[#faf8f5]/90 dark:bg-[#0c0a14]/90 backdrop-blur-xl border-b border-[#e0d5c7] dark:border-[#2d2545] shadow-lg shadow-[#2c1810]/5 dark:shadow-none'
                : 'bg-transparent border-b border-transparent'
            }
        `}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center py-0">
                        <Logo className="w-56 md:w-64" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={(e) => scrollToSection(e, link.href)}
                                className="px-4 py-2 rounded-xl text-[#8b7355] dark:text-[#a39484] hover:text-[#2c1810] dark:hover:text-[#f5f0eb] hover:bg-[#f3efe8] dark:hover:bg-[#241e36]/50 font-medium transition-all duration-300"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="w-px h-6 bg-[#e0d5c7] dark:bg-[#2d2545] mx-2" />

                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20 font-medium transition-all"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#f3efe8] dark:hover:bg-[#241e36] text-[#8b7355] dark:text-[#a39484] hover:text-[#2c1810] dark:hover:text-[#f5f0eb] transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/auth/login"
                                    className="px-5 py-2.5 rounded-xl text-[#8b7355] dark:text-[#a39484] hover:text-[#2c1810] dark:hover:text-[#f5f0eb] font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="px-6 py-2.5 rounded-xl btn-gradient text-white font-medium shadow-lg shadow-primary-500/20 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-[#f3efe8] dark:hover:bg-[#241e36] text-[#8b7355] dark:text-[#a39484] transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div className={`
                    md:hidden overflow-y-auto transition-all duration-300
                    ${isMenuOpen ? 'max-h-[calc(100vh-5rem)] opacity-100' : 'max-h-0 opacity-0'}
                `}>
                    <div className="py-4 border-t border-[#e0d5c7] dark:border-[#2d2545] space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={(e) => scrollToSection(e, link.href)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#8b7355] dark:text-[#a39484] hover:text-[#2c1810] dark:hover:text-[#f5f0eb] hover:bg-[#f3efe8] dark:hover:bg-[#241e36]/50 transition-colors"
                            >
                                {link.icon && <link.icon className="w-4 h-4" />}
                                {link.label}
                            </Link>
                        ))}

                        <div className="flex items-center justify-between px-4 py-2">
                            <span className="text-sm text-[#8b7355] dark:text-[#a39484]">Theme</span>
                            <ThemeToggle />
                        </div>

                        <div className="my-2 border-t border-[#e0d5c7] dark:border-[#2d2545]" />

                        {user ? (
                            <div className="space-y-2 px-4">
                                <div className="flex items-center gap-2 py-2 text-[#8b7355] dark:text-[#a39484]">
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
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="flex items-center justify-center w-full gap-2 px-4 py-3 rounded-xl hover:bg-[#f3efe8] dark:hover:bg-[#241e36] text-[#8b7355] dark:text-[#a39484] hover:text-[#2c1810] dark:hover:text-[#f5f0eb]"
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
                                    className="w-full py-3 text-center rounded-xl bg-[#f3efe8] dark:bg-[#241e36] text-[#2c1810] dark:text-[#f5f0eb] font-medium"
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
