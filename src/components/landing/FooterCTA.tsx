'use client';

import Link from 'next/link';
import { ArrowRight, Twitter, Github, Linkedin, BookOpen } from 'lucide-react';
import Logo from '@/components/Logo';

export function CTA({ user }: { user: any }) {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-[#0c0a14] via-[#7c5cfc]/5 dark:via-[#9b7aff]/5 to-white dark:to-[#0c0a14] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-display font-bold text-[#2c1810] dark:text-[#f5f0eb] mb-8 tracking-tight">
                    Start Your Reading <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c5cfc] to-[#e8914f]">
                        Revolution Today
                    </span>
                </h2>
                <p className="text-xl text-[#8b7355] dark:text-[#a39484] mb-10 max-w-2xl mx-auto">
                    Join thousands of readers who are saving money and reading more with ApicBooks. No credit card required.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="bg-[#2c1810] dark:bg-[#f5f0eb] text-white dark:text-[#2c1810] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1a0f08] dark:hover:bg-[#e0d5c7] transition-colors shadow-xl shadow-[#2c1810]/10 dark:shadow-white/5"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/auth/signup"
                            className="btn-gradient px-8 py-4 rounded-xl font-bold text-lg text-white shadow-xl shadow-[#7c5cfc]/20 flex items-center gap-2 group"
                        >
                            Create Free Account
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

export function Footer() {
    return (
        <footer className="border-t border-[#e0d5c7] dark:border-[#2d2545] bg-[#f3efe8] dark:bg-[#0c0a14] pt-16 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 mb-4">
                        <Logo className="w-44" />
                    </Link>
                    <p className="text-[#a39484] dark:text-[#8b7355] text-sm leading-relaxed">
                        The intelligent platform for modern readers. Track, discover, and save.
                    </p>
                </div>

                <div>
                    <h4 className="text-[#2c1810] dark:text-[#f5f0eb] font-bold mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-[#8b7355] dark:text-[#a39484]">
                        <li><Link href="#" className="hover:text-[#7c5cfc] dark:hover:text-[#9b7aff] transition-colors">Features</Link></li>
                        <li><Link href="#" className="hover:text-[#7c5cfc] dark:hover:text-[#9b7aff] transition-colors">API</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-[#2c1810] dark:text-[#f5f0eb] font-bold mb-4">Company</h4>
                    <ul className="space-y-2 text-sm text-[#8b7355] dark:text-[#a39484]">
                        <li><Link href="#" className="hover:text-[#7c5cfc] dark:hover:text-[#9b7aff] transition-colors">About</Link></li>
                        <li><Link href="#" className="hover:text-[#7c5cfc] dark:hover:text-[#9b7aff] transition-colors">Blog</Link></li>
                        <li><Link href="#" className="hover:text-[#7c5cfc] dark:hover:text-[#9b7aff] transition-colors">Careers</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-[#2c1810] dark:text-[#f5f0eb] font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-[#8b7355] dark:text-[#a39484]">
                        <li><Link href="#" className="hover:text-[#7c5cfc] dark:hover:text-[#9b7aff] transition-colors">Privacy</Link></li>
                        <li><Link href="#" className="hover:text-[#7c5cfc] dark:hover:text-[#9b7aff] transition-colors">Terms</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-[#e0d5c7] dark:border-[#2d2545] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-[#a39484] dark:text-[#8b7355] text-sm">
                    © 2026 ApicBooks Inc. All rights reserved. Made with love ❤️ for book lovers
                </div>
                <div className="flex items-center gap-4">
                    <Link href="#" className="text-[#a39484] dark:text-[#8b7355] hover:text-[#2c1810] dark:hover:text-[#f5f0eb] transition-colors"><Twitter className="w-5 h-5" /></Link>
                    <Link href="#" className="text-[#a39484] dark:text-[#8b7355] hover:text-[#2c1810] dark:hover:text-[#f5f0eb] transition-colors"><Github className="w-5 h-5" /></Link>
                    <Link href="#" className="text-[#a39484] dark:text-[#8b7355] hover:text-[#2c1810] dark:hover:text-[#f5f0eb] transition-colors"><Linkedin className="w-5 h-5" /></Link>
                </div>
            </div>
        </footer>
    );
}
