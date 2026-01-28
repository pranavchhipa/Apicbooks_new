'use client';

import Link from 'next/link';
import { ArrowRight, Twitter, Github, Linkedin, BookOpen } from 'lucide-react';

export function CTA({ user }: { user: any }) {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-primary-950/20 to-slate-950 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8 tracking-tight">
                    Start Your Reading <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                        Revolution Today
                    </span>
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                    Join thousands of readers who are saving money and reading more with ApicBooks. No credit card required.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 transition-colors shadow-xl shadow-white/5"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/auth/signup"
                            className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 transition-colors shadow-xl shadow-white/5 flex items-center gap-2 group"
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
        <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 mb-4">
                        <img src="/logo-new.png" alt="ApicBooks" className="w-32 h-auto" />
                    </Link>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        The intelligent platform for modern readers. Track, discover, and save.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link href="#" className="hover:text-primary-400 transition-colors">Features</Link></li>
                        <li><Link href="#" className="hover:text-primary-400 transition-colors">API</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">Company</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link href="#" className="hover:text-primary-400 transition-colors">About</Link></li>
                        <li><Link href="#" className="hover:text-primary-400 transition-colors">Blog</Link></li>
                        <li><Link href="#" className="hover:text-primary-400 transition-colors">Careers</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link href="#" className="hover:text-primary-400 transition-colors">Privacy</Link></li>
                        <li><Link href="#" className="hover:text-primary-400 transition-colors">Terms</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-slate-600 text-sm">
                    © 2026 ApicBooks Inc. All rights reserved. Made with love ❤️ for book lovers
                </div>
                <div className="flex items-center gap-4">
                    <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></Link>
                    <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></Link>
                    <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></Link>
                </div>
            </div>
        </footer>
    );
}
