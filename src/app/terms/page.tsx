'use client';

import { useRef } from 'react';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';

const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'service', title: 'Description of Service' },
    { id: 'account', title: 'User Accounts' },
    { id: 'conduct', title: 'User Conduct' },
    { id: 'intellectual', title: 'Intellectual Property' },
    { id: 'disclaimers', title: 'Disclaimers' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'termination', title: 'Termination' },
    { id: 'governing', title: 'Governing Law' },
    { id: 'contact', title: 'Contact' },
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

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-midnight">
            <Navbar user={null} />

            {/* Header */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-amber-500/[0.05] blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <FadeIn>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
                            <FileText className="w-8 h-8 text-amber-400" />
                        </div>
                        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                            Terms of <span className="font-serif italic text-amber-400">Service</span>
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
                                    Welcome to ApicBooks. By accessing or using our website and services, you agree to be bound
                                    by these Terms of Service. Please read them carefully.
                                </p>

                                <section id="acceptance" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        1. Acceptance of Terms
                                    </h2>
                                    <p className="text-white/60 font-sans leading-relaxed">
                                        By accessing or using ApicBooks ("Service"), you agree to be bound by these Terms of Service
                                        and all applicable laws and regulations. If you do not agree with any of these terms, you are
                                        prohibited from using or accessing this site.
                                    </p>
                                </section>

                                <section id="service" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        2. Description of Service
                                    </h2>
                                    <p className="text-white/60 mb-4 font-sans">
                                        ApicBooks provides a book price comparison service that:
                                    </p>
                                    <ul className="list-disc list-inside text-white/60 space-y-2 ml-4 font-sans">
                                        <li>Aggregates book prices from multiple online retailers</li>
                                        <li>Offers AI-powered book recommendations based on mood</li>
                                        <li>Provides wishlist and price alert features for registered users</li>
                                        <li>Displays affiliate links to third-party retailers</li>
                                    </ul>
                                    <p className="text-white/60 mt-4 font-sans">
                                        We do not sell books directly. All purchases are made through third-party retailers.
                                    </p>
                                </section>

                                <section id="account" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        3. User Accounts
                                    </h2>
                                    <p className="text-white/60 mb-4 font-sans">
                                        When you create an account with us, you must provide accurate and complete information.
                                        You are responsible for:
                                    </p>
                                    <ul className="list-disc list-inside text-white/60 space-y-2 ml-4 font-sans">
                                        <li>Safeguarding your password</li>
                                        <li>All activities that occur under your account</li>
                                        <li>Notifying us immediately of any unauthorized use</li>
                                    </ul>
                                </section>

                                <section id="conduct" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        4. User Conduct
                                    </h2>
                                    <p className="text-white/60 mb-4 font-sans">You agree not to:</p>
                                    <ul className="list-disc list-inside text-white/60 space-y-2 ml-4 font-sans">
                                        <li>Use the service for any unlawful purpose</li>
                                        <li>Attempt to gain unauthorized access to our systems</li>
                                        <li>Interfere with or disrupt the service</li>
                                        <li>Scrape or collect data without permission</li>
                                        <li>Transmit viruses or harmful code</li>
                                        <li>Impersonate any person or entity</li>
                                    </ul>
                                </section>

                                <section id="intellectual" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        5. Intellectual Property
                                    </h2>
                                    <p className="text-white/60 font-sans leading-relaxed">
                                        The Service and its original content, features, and functionality are owned by ApicBooks
                                        and are protected by international copyright, trademark, and other intellectual property laws.
                                        Book cover images and retailer logos are property of their respective owners.
                                    </p>
                                </section>

                                <section id="disclaimers" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        6. Disclaimers
                                    </h2>
                                    <p className="text-white/60 mb-4 font-sans">
                                        The Service is provided "as is" without warranties of any kind. We do not guarantee:
                                    </p>
                                    <ul className="list-disc list-inside text-white/60 space-y-2 ml-4 font-sans">
                                        <li>Accuracy of prices displayed (prices change frequently)</li>
                                        <li>Availability of books at listed retailers</li>
                                        <li>Uninterrupted or error-free service</li>
                                        <li>Results from AI recommendations</li>
                                    </ul>
                                </section>

                                <section id="liability" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        7. Limitation of Liability
                                    </h2>
                                    <p className="text-white/60 font-sans leading-relaxed">
                                        ApicBooks shall not be liable for any indirect, incidental, special, consequential, or
                                        punitive damages resulting from your use of the Service. Our total liability shall not
                                        exceed the amount paid by you, if any, for accessing the Service.
                                    </p>
                                </section>

                                <section id="termination" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        8. Termination
                                    </h2>
                                    <p className="text-white/60 font-sans leading-relaxed">
                                        We may terminate or suspend your account and access to the Service immediately, without
                                        prior notice, for any reason, including breach of these Terms. Upon termination, your
                                        right to use the Service will immediately cease.
                                    </p>
                                </section>

                                <section id="governing" className="mb-10">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        9. Governing Law
                                    </h2>
                                    <p className="text-white/60 font-sans leading-relaxed">
                                        These Terms shall be governed by the laws of the State of California, United States,
                                        without regard to its conflict of law provisions. Any disputes shall be resolved in
                                        the courts located in San Francisco, California.
                                    </p>
                                </section>

                                <section id="contact">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        10. Contact
                                    </h2>
                                    <p className="text-white/60 font-sans leading-relaxed">
                                        If you have questions about these Terms, please contact us at{' '}
                                        <a href="mailto:legal@apicbooks.com" className="text-amber-400 hover:text-amber-300 transition-colors">
                                            legal@apicbooks.com
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
