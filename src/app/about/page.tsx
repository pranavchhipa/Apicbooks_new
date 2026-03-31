'use client';

import { useRef } from 'react';
import { BookOpen, Target, Heart, Lightbulb, Users, Rocket, Mail } from 'lucide-react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';

const values = [
    {
        icon: Target,
        title: 'Transparency',
        description: 'Real prices from real retailers with no hidden fees or biased rankings.',
        gradient: 'from-amber-500/20 to-amber-600/5',
        iconColor: 'text-amber-400',
    },
    {
        icon: Heart,
        title: 'Accessibility',
        description: 'Books should be affordable for everyone. We help you find the best deals.',
        gradient: 'from-rose-500/20 to-rose-600/5',
        iconColor: 'text-rose-400',
    },
    {
        icon: Lightbulb,
        title: 'Innovation',
        description: 'AI-powered search helps you discover books based on mood, theme, or feeling.',
        gradient: 'from-violet-500/20 to-violet-600/5',
        iconColor: 'text-violet-400',
    },
    {
        icon: Users,
        title: 'Community',
        description: 'Built by book lovers, for book lovers. Your feedback shapes our product.',
        gradient: 'from-emerald-500/20 to-emerald-600/5',
        iconColor: 'text-emerald-400',
    },
];

const team = [
    { name: 'Alex Rivera', role: 'Founder & CEO', initials: 'AR', bio: 'Former engineer with a passion for making books accessible.' },
    { name: 'Sarah Kim', role: 'CTO', initials: 'SK', bio: 'ML specialist who built our AI recommendation engine.' },
    { name: 'Marcus Johnson', role: 'Head of Product', initials: 'MJ', bio: 'UX designer focused on making book discovery delightful.' },
    { name: 'Emily Chen', role: 'Head of Partnerships', initials: 'EC', bio: 'Building relationships with retailers worldwide.' },
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

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-midnight">
            <Navbar user={null} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                {/* Ambient glows */}
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-amber-500/[0.07] blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-violet-500/[0.05] blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/60 text-sm font-medium mb-6 backdrop-blur-xl">
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>About Us</span>
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.1}>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
                            Making Books{' '}
                            <span className="font-serif italic text-amber-400">Accessible</span>{' '}
                            to Everyone
                        </h1>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto font-sans leading-relaxed">
                            We believe everyone deserves access to great literature without breaking the bank.
                            ApicBooks helps you find the best prices across hundreds of retailers.
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <FadeIn>
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-amber-400 text-sm font-medium mb-4">
                                    <Target className="w-3.5 h-3.5" />
                                    Our Mission
                                </div>
                                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-6 tracking-tight">
                                    Empowering Readers{' '}
                                    <span className="font-serif italic text-amber-400">Worldwide</span>
                                </h2>
                                <p className="text-white/60 mb-6 font-sans leading-relaxed">
                                    In a world where book prices vary dramatically across retailers, we saw an opportunity
                                    to level the playing field. ApicBooks was born from frustration -- spending hours
                                    comparing prices across websites just to find a good deal.
                                </p>
                                <p className="text-white/60 mb-8 font-sans leading-relaxed">
                                    Today, we help readers save time and money. Our AI-powered
                                    platform searches across retailers in seconds, ensuring you always get the best
                                    price for your next read.
                                </p>
                                <div className="flex items-center gap-4">
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Get in Touch
                                    </Link>
                                    <Link
                                        href="/features"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.03] border border-white/[0.06] text-white font-semibold text-sm hover:bg-white/[0.06] backdrop-blur-xl transition-all duration-200"
                                    >
                                        See Features
                                    </Link>
                                </div>
                            </div>
                        </FadeIn>
                        <div className="grid grid-cols-2 gap-4">
                            {values.map((value, index) => (
                                <FadeIn key={value.title} delay={index * 0.1}>
                                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 group">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-4 border border-white/[0.06]`}>
                                            <value.icon className={`w-6 h-6 ${value.iconColor}`} />
                                        </div>
                                        <h3 className="text-white font-semibold mb-2">{value.title}</h3>
                                        <p className="text-white/40 text-sm font-sans">{value.description}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24" id="team">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-violet-400 text-sm font-medium mb-4">
                            <Users className="w-3.5 h-3.5" />
                            Our Team
                        </div>
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                            Meet the{' '}
                            <span className="font-serif italic text-amber-400">Bookworms</span>
                        </h2>
                        <p className="text-white/40 max-w-2xl mx-auto font-sans">
                            A passionate team of readers, engineers, and designers united by our love for books.
                        </p>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member, index) => (
                            <FadeIn key={member.name} delay={index * 0.1}>
                                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl text-center p-6 group hover:bg-white/[0.05] transition-all duration-300">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface border border-white/[0.1] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <span className="font-display text-xl font-bold text-amber-400">{member.initials}</span>
                                    </div>
                                    <h3 className="text-white font-semibold text-lg">{member.name}</h3>
                                    <p className="text-amber-400 text-sm mb-3 font-medium">{member.role}</p>
                                    <p className="text-white/40 text-sm font-sans">{member.bio}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <FadeIn>
                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-12 relative overflow-hidden">
                            {/* Ambient glow */}
                            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/[0.06] blur-[100px]" />
                            </div>

                            <div className="relative">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-white/[0.06] flex items-center justify-center">
                                    <Rocket className="w-8 h-8 text-amber-400" />
                                </div>
                                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                                    Join Our <span className="font-serif italic text-amber-400">Mission</span>
                                </h2>
                                <p className="text-white/40 mb-8 max-w-lg mx-auto font-sans leading-relaxed">
                                    We are always looking for passionate people to join our team.
                                    Help us make books accessible to everyone.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-black font-semibold text-base hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Contact Us
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </div>
    );
}
