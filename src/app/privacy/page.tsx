'use client';

import { useRef } from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';

const sections = [
    { id: 'information', title: 'Information We Collect' },
    { id: 'usage', title: 'How We Use Your Information' },
    { id: 'sharing', title: 'Information Sharing' },
    { id: 'cookies', title: 'Cookies & Tracking' },
    { id: 'security', title: 'Data Security' },
    { id: 'rights', title: 'Your Rights' },
    { id: 'changes', title: 'Policy Changes' },
    { id: 'contact', title: 'Contact Us' },
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

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-midnight">
            <Navbar user={null} />

            {/* Header */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-violet-500/[0.05] blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <FadeIn>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-6">
                            <Shield className="w-8 h-8 text-violet-400" />
                        </div>
                        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                            Privacy <span className="font-serif italic text-amber-400">Policy</span>
                        </h1>
                        <p className="text-white/40 font-sans">Last updated: January 24, 2026</p>
                    </FadeIn>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Table of Contents */}
                    <nav className="lg:col-span-1">
                        <FadeIn>
                            <div className="sticky top-24 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4">
                                <h3 className="text-white font-semibold mb-4 text-sm">Contents</h3>
                                <ul className="space-y-2">
                                    {sections.map((section) => (
                                        <li key={section.id}>
                                            <a
                                                href={`#${section.id}`}
                                                className="text-sm text-white/40 hover:text-amber-400 transition-colors"
                                            >
                                                {section.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </FadeIn>
                    </nav>

                    {/* Content */}
                    <FadeIn className="lg:col-span-3" delay={0.1}>
                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8">
                            <div className="max-w-none">
                                <p className="text-white/60 mb-8 font-sans leading-relaxed">
                                    At ApicBooks, we take your privacy seriously. This Privacy Policy explains how we collect,
                                    use, disclose, and safeguard your information when you use our website and services.
                                </p>

                                <section id="information" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Information We Collect
                                    </h2>
                                    <p className="text-white/60 mb-4 font-sans">We may collect information about you in various ways:</p>
                                    <ul className="list-disc list-inside text-white/60 space-y-2 ml-4 font-sans">
                                        <li><strong className="text-white/80">Personal Data:</strong> Name, email address when you create an account</li>
                                        <li><strong className="text-white/80">Usage Data:</strong> Search queries, pages visited, time spent on site</li>
                                        <li><strong className="text-white/80">Device Data:</strong> Browser type, IP address, device identifiers</li>
                                        <li><strong className="text-white/80">Wishlist Data:</strong> Books you save and price alerts you set</li>
                                    </ul>
                                </section>

                                <section id="usage" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        How We Use Your Information
                                    </h2>
                                    <p className="text-white/60 mb-4 font-sans">We use the collected data for:</p>
                                    <ul className="list-disc list-inside text-white/60 space-y-2 ml-4 font-sans">
                                        <li>Providing and maintaining our service</li>
                                        <li>Sending price alerts and notifications you have opted into</li>
                                        <li>Improving our search algorithms and recommendations</li>
                                        <li>Analyzing usage patterns to enhance user experience</li>
                                        <li>Communicating with you about updates and features</li>
                                    </ul>
                                </section>

                                <section id="sharing" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Information Sharing
                                    </h2>
                                    <p className="text-white/60 mb-4 font-sans">
                                        We do not sell your personal information. We may share data with:
                                    </p>
                                    <ul className="list-disc list-inside text-white/60 space-y-2 ml-4 font-sans">
                                        <li><strong className="text-white/80">Service Providers:</strong> Third parties that help us operate our platform</li>
                                        <li><strong className="text-white/80">Analytics Partners:</strong> To understand how our service is used</li>
                                        <li><strong className="text-white/80">Legal Requirements:</strong> When required by law or to protect rights</li>
                                    </ul>
                                </section>

                                <section id="cookies" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Cookies & Tracking
                                    </h2>
                                    <p className="text-white/60 mb-4 font-sans">
                                        We use cookies and similar tracking technologies to:
                                    </p>
                                    <ul className="list-disc list-inside text-white/60 space-y-2 ml-4 font-sans">
                                        <li>Remember your preferences and settings</li>
                                        <li>Analyze site traffic and usage</li>
                                        <li>Enable certain site functionalities</li>
                                        <li>Provide personalized content</li>
                                    </ul>
                                    <p className="text-white/60 mt-4 font-sans">
                                        You can control cookies through your browser settings. Disabling cookies may limit some features.
                                    </p>
                                </section>

                                <section id="security" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Data Security
                                    </h2>
                                    <p className="text-white/60 font-sans leading-relaxed">
                                        We implement industry-standard security measures to protect your data, including encryption,
                                        secure servers, and regular security audits. However, no method of transmission over the
                                        Internet is 100% secure.
                                    </p>
                                </section>

                                <section id="rights" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Your Rights
                                    </h2>
                                    <p className="text-white/60 mb-4 font-sans">You have the right to:</p>
                                    <ul className="list-disc list-inside text-white/60 space-y-2 ml-4 font-sans">
                                        <li>Access the personal data we hold about you</li>
                                        <li>Request correction of inaccurate data</li>
                                        <li>Request deletion of your data</li>
                                        <li>Opt out of marketing communications</li>
                                        <li>Export your data in a portable format</li>
                                    </ul>
                                </section>

                                <section id="changes" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Policy Changes
                                    </h2>
                                    <p className="text-white/60 font-sans leading-relaxed">
                                        We may update this Privacy Policy from time to time. We will notify you of any changes by
                                        posting the new policy on this page and updating the "Last updated" date.
                                    </p>
                                </section>

                                <section id="contact">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Contact Us
                                    </h2>
                                    <p className="text-white/60 font-sans leading-relaxed">
                                        If you have questions about this Privacy Policy, please contact us at{' '}
                                        <a href="mailto:privacy@apicbooks.com" className="text-amber-400 hover:text-amber-300 transition-colors">
                                            privacy@apicbooks.com
                                        </a>{' '}
                                        or visit our{' '}
                                        <Link href="/contact" className="text-amber-400 hover:text-amber-300 transition-colors">
                                            Contact page
                                        </Link>.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
