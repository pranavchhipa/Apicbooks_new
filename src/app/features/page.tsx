'use client';

import { useRef } from 'react';
import { Search, Sparkles, Bell, Heart, TrendingUp, Globe, ArrowRight, Check, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';

const features = [
    {
        icon: Search,
        title: 'Universal Search',
        description: 'Search by title, author, ISBN, or keywords across multiple retailers simultaneously.',
        gradient: 'from-amber-500/20 to-amber-600/5',
        iconColor: 'text-amber-400',
    },
    {
        icon: Sparkles,
        title: 'AI Mood Discovery',
        description: "Tell us how you're feeling and our AI will recommend the perfect book for your mood.",
        gradient: 'from-violet-500/20 to-violet-600/5',
        iconColor: 'text-violet-400',
    },
    {
        icon: TrendingUp,
        title: 'Price Comparison',
        description: 'See prices side-by-side from all major retailers. Find the best deal instantly.',
        gradient: 'from-emerald-500/20 to-emerald-600/5',
        iconColor: 'text-emerald-400',
    },
    {
        icon: Bell,
        title: 'Price Alerts',
        description: 'Get notified when prices drop on your wishlist items. Never miss a deal.',
        gradient: 'from-rose-500/20 to-rose-600/5',
        iconColor: 'text-rose-400',
    },
    {
        icon: Heart,
        title: 'Smart Wishlist',
        description: 'Save books for later and track prices over time. Share lists with friends.',
        gradient: 'from-amber-500/20 to-amber-600/5',
        iconColor: 'text-amber-400',
    },
    {
        icon: Globe,
        title: 'Global Coverage',
        description: 'Compare prices from retailers worldwide. Available across many countries.',
        gradient: 'from-violet-500/20 to-violet-600/5',
        iconColor: 'text-violet-400',
    },
];

const benefits = [
    'Compare new and used book prices',
    'No registration required for searches',
    'Real-time price updates',
    'Mobile-friendly experience',
    'No ads or spam',
    'Free to use',
];

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-midnight">
            <Navbar user={null} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-violet-500/[0.06] blur-[120px]" />
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-amber-500/[0.05] blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/60 text-sm font-medium mb-6 backdrop-blur-xl">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Features</span>
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.1}>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
                            Everything You Need to{' '}
                            <span className="font-serif italic text-amber-400">Save</span> on Books
                        </h1>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 font-sans">
                            Powerful tools to find, compare, and track book prices -- all completely free.
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.3}>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-black font-semibold text-base hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Start Searching
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </FadeIn>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn className="text-center mb-16">
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                            Powerful <span className="font-serif italic text-amber-400">Features</span>
                        </h2>
                        <p className="text-white/40 max-w-2xl mx-auto font-sans">
                            Built for book lovers who want to save money without sacrificing discovery.
                        </p>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <FadeIn key={feature.title} delay={index * 0.08}>
                                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.05] transition-all duration-300 text-center group h-full">
                                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-white/[0.06] flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                    <p className="text-white/40 font-sans">{feature.description}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <FadeIn>
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-violet-400 text-sm font-medium mb-4">
                                    Why Choose Us
                                </div>
                                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-6 tracking-tight">
                                    The Smart Way to{' '}
                                    <span className="font-serif italic text-amber-400">Buy</span> Books
                                </h2>
                                <p className="text-white/60 mb-8 font-sans leading-relaxed">
                                    Stop wasting time checking multiple websites. ApicBooks does the hard work
                                    so you can focus on what matters -- reading great books.
                                </p>
                                <ul className="space-y-4">
                                    {benefits.map((benefit) => (
                                        <li key={benefit} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            </div>
                                            <span className="text-white/60 font-sans">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.15}>
                            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8">
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Ready to find your next read?
                                </h3>
                                <p className="text-white/40 mb-6 font-sans">
                                    Search across retailers and compare prices in seconds. No account needed.
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Try It Now
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <FadeIn>
                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-12 relative overflow-hidden">
                            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-violet-500/[0.06] blur-[100px]" />
                            </div>

                            <div className="relative">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/5 border border-white/[0.06] flex items-center justify-center">
                                    <Zap className="w-8 h-8 text-violet-400" />
                                </div>
                                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                                    Ready to Save <span className="font-serif italic text-amber-400">Money</span>?
                                </h2>
                                <p className="text-white/40 mb-8 max-w-lg mx-auto font-sans leading-relaxed">
                                    Start searching for books and comparing prices today.
                                    No registration required.
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-black font-semibold text-base hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Search for Books
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </div>
    );
}
