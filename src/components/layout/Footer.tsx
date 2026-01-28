'use client';

import Link from 'next/link';
import { BookOpen, Mail, Github, Twitter, Linkedin, Heart, Send } from 'lucide-react';
import { useState } from 'react';

const footerLinks = {
    product: [
        { label: 'Features', href: '/features' },
        { label: 'How It Works', href: '/#how-it-works' },
        { label: 'Pricing', href: '/features#pricing' },
        { label: 'API', href: '/features#api' },
    ],
    company: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Careers', href: '/about#careers' },
        { label: 'Press', href: '/about#press' },
    ],
    resources: [
        { label: 'Blog', href: '/blog' },
        { label: 'Help Center', href: '/contact#faq' },
        { label: 'Community', href: '/community' },
        { label: 'Partners', href: '/partners' },
    ],
    legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/privacy#cookies' },
    ],
};

const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate subscription
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <footer className="border-t border-slate-800 bg-slate-900/50">
            {/* Newsletter Section */}
            <div className="border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-left">
                            <h3 className="text-2xl font-display font-bold text-white mb-2">
                                Get the best book deals
                            </h3>
                            <p className="text-slate-400">
                                Subscribe to our newsletter for exclusive price alerts and recommendations.
                            </p>
                        </div>

                        <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-3">
                            <div className="relative flex-1 lg:w-80">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="input-field pl-12 py-3"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-primary px-6 py-3 flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                <span className="hidden sm:inline">Subscribe</span>
                            </button>
                        </form>

                        {subscribed && (
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-emerald-400 text-sm animate-fade-in">
                                Thanks for subscribing!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 group mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-display font-bold text-white">
                                Apic<span className="gradient-text">Books</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm mb-6 max-w-xs">
                            Find the best book prices across Amazon, eBay, and more.
                            Save money on your next read with our AI-powered search.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-400 text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-400 text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-400 text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-400 text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-slate-500 text-sm">
                            © {new Date().getFullYear()} ApicBooks. All rights reserved.
                        </p>
                        <p className="text-slate-500 text-sm flex items-center gap-1">
                            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for book lovers
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
