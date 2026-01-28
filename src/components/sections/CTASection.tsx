'use client';

import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CTASection() {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background gradient mesh */}
            <div className="absolute inset-0 hero-gradient-mesh" />

            {/* Floating orbs */}
            <div className="orb-container">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="glass-accent rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-secondary-500/20 to-transparent rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 mb-6">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                            <span className="text-sm text-primary-300 font-medium">Start Saving Today</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                            Ready to Find Your Next{' '}
                            <span className="gradient-text-animated">Great Read?</span>
                        </h2>

                        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                            Search across hundreds of retailers in seconds. Compare prices and save money on every book purchase.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/" className="btn-gradient px-8 py-4 text-lg flex items-center gap-2 group">
                                Start Searching
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/features" className="btn-secondary px-8 py-4 text-lg">
                                Learn More
                            </Link>
                        </div>

                        <p className="text-slate-500 text-sm mt-6">
                            Free to use • No registration required • Instant results
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
