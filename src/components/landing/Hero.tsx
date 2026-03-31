'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, PlayCircle } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-12 pb-20 overflow-hidden bg-[#faf8f5] dark:bg-[#0c0a14]">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7c5cfc]/8 dark:bg-[#9b7aff]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#e8914f]/8 dark:bg-[#f0a45d]/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold text-[#2c1810] dark:text-[#f5f0eb] tracking-tight mb-6 leading-[1.1]">
                        Track, Compare, & <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c5cfc] via-[#9b7aff] to-[#e8914f] animate-gradient-x">
                            Read Smarter
                        </span>
                    </h1>
                </motion.div>

                {/* Subheadline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-2xl mx-auto mb-10"
                >
                    <p className="text-lg md:text-xl text-[#8b7355] dark:text-[#a39484] leading-relaxed">
                        The ultimate companion for book lovers. Track your reading stats, get price drop alerts from multiple sources, and discover community favorites.
                    </p>
                </motion.div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-20"
                >
                    <Link
                        href="/auth/signup"
                        className="w-full sm:w-auto px-8 py-4 rounded-xl btn-gradient text-white font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-xl shadow-[#7c5cfc]/20"
                    >
                        Start for Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="#features"
                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#f3efe8] dark:bg-[#241e36]/50 text-[#2c1810] dark:text-[#f5f0eb] font-medium text-lg border border-[#e0d5c7] dark:border-[#2d2545] hover:bg-[#ebe5dc] dark:hover:bg-[#241e36] transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                        <PlayCircle className="w-5 h-5" />
                        Explore Features
                    </Link>
                </motion.div>


                {/* Real Dashboard Image with 3D Effect */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                    className="relative z-10 w-full max-w-6xl perspective-1000 group"
                >
                    <div className="relative rounded-2xl bg-white dark:bg-[#1a1528] border border-[#e0d5c7] dark:border-[#2d2545]/50 shadow-2xl ring-1 ring-[#2c1810]/5 dark:ring-white/10 overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e0d5c7]/50 dark:via-white/20 to-transparent z-20" />

                        {/* The Actual Image */}
                        <Image
                            src="/landing-dashboard.png"
                            alt="ApicBooks Dashboard Preview"
                            width={1920}
                            height={1080}
                            className="w-full h-auto object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                            priority
                        />

                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5]/30 dark:from-[#0c0a14]/50 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Glow Effect behind */}
                    <div className="absolute -inset-4 bg-[#7c5cfc]/10 dark:bg-[#9b7aff]/20 blur-3xl -z-10 opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
                </motion.div>
            </div>
        </section>
    );
}
