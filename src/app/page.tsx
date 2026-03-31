'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Users,
    BarChart3,
    Sparkles,
    Star,
    TrendingUp,
    Heart,
    MessageCircle,
    ChevronRight,
    BookMarked,
    Target,
    Flame,
    Zap,
    Globe,
    Shield,
    ArrowUpRight,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

/* ────────────────────────────────────────────────────────────────────────── */
/*  DATA                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

const BOOK_COVERS = [
    { title: 'The Great Gatsby', isbn: '9780743273565' },
    { title: 'To Kill a Mockingbird', isbn: '9780061120084' },
    { title: 'Pride and Prejudice', isbn: '9780141439518' },
    { title: '1984', isbn: '9780451524935' },
    { title: 'The Catcher in the Rye', isbn: '9780316769488' },
    { title: 'Beloved', isbn: '9781400033416' },
    { title: 'The Alchemist', isbn: '9780062315007' },
    { title: 'Dune', isbn: '9780441013593' },
    { title: 'Normal People', isbn: '9781984822185' },
    { title: 'Circe', isbn: '9780316556347' },
    { title: 'Educated', isbn: '9780399590504' },
    { title: 'Where the Crawdads Sing', isbn: '9780735219106' },
];

const FEATURES = [
    {
        icon: BookOpen,
        title: 'Track Everything',
        description: 'Shelves, progress, ratings, reviews. Your entire reading life in one place.',
        color: 'from-amber-500/20 to-amber-600/5',
        iconColor: 'text-amber-400',
    },
    {
        icon: Users,
        title: 'Book Clubs',
        description: 'Join vibrant communities. Discuss weekly. Make friends who love the same stories.',
        color: 'from-violet-500/20 to-violet-600/5',
        iconColor: 'text-violet-400',
    },
    {
        icon: Sparkles,
        title: 'AI Discovery',
        description: 'Tell us your mood. Our AI finds your next obsession from millions of books.',
        color: 'from-emerald-500/20 to-emerald-600/5',
        iconColor: 'text-emerald-400',
    },
    {
        icon: BarChart3,
        title: 'Reading Analytics',
        description: 'Beautiful charts. Reading streaks. Annual goals. Watch your library grow.',
        color: 'from-rose-500/20 to-rose-600/5',
        iconColor: 'text-rose-400',
    },
];

const CLUBS = [
    {
        name: 'Literary Fiction Circle',
        tagline: 'For lovers of character-driven stories',
        currentBook: 'Tomorrow, and Tomorrow, and Tomorrow',
        gradient: 'from-amber-500/10 to-transparent',
        borderGlow: 'hover:border-amber-500/30',
    },
    {
        name: 'Sci-Fi & Fantasy Guild',
        tagline: 'Explore worlds beyond imagination',
        currentBook: 'The Left Hand of Darkness',
        gradient: 'from-violet-500/10 to-transparent',
        borderGlow: 'hover:border-violet-500/30',
    },
    {
        name: 'Non-Fiction Explorers',
        tagline: 'Learn something new every week',
        currentBook: 'Sapiens',
        gradient: 'from-emerald-500/10 to-transparent',
        borderGlow: 'hover:border-emerald-500/30',
    },
    {
        name: 'Poetry & Prose',
        tagline: 'Where words become art',
        currentBook: 'Milk and Honey',
        gradient: 'from-rose-500/10 to-transparent',
        borderGlow: 'hover:border-rose-500/30',
    },
];

const TESTIMONIALS = [
    {
        name: 'Sarah K.',
        avatar: 'S',
        text: '"ApicBooks changed the way I read. I\'ve finished more books this year than the last three combined."',
        role: 'Book Blogger',
        stars: 5,
    },
    {
        name: 'Marcus J.',
        avatar: 'M',
        text: '"The book clubs are incredible. I\'ve made real friends through our weekly discussions."',
        role: 'Software Engineer',
        stars: 5,
    },
    {
        name: 'Priya L.',
        avatar: 'P',
        text: '"The AI recommendations actually understand my taste. It found my new favorite book."',
        role: 'Graduate Student',
        stars: 5,
    },
];

const STATS = [
    { value: '∞', label: 'Books to Discover' },
    { value: '24/7', label: 'Reading Community' },
    { value: 'Free', label: 'Forever' },
    { value: '100%', label: 'Open to All' },
];

/* ────────────────────────────────────────────────────────────────────────── */
/*  REUSABLE COMPONENTS                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function SectionBadge({ icon: Icon, label, variant = 'amber' }: { icon: any; label: string; variant?: 'amber' | 'violet' | 'emerald' }) {
    const colors = {
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-display font-semibold tracking-wider uppercase border ${colors[variant]}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  LANDING PAGE                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
    const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

    return (
        <main className="min-h-screen bg-midnight text-white overflow-hidden">
            <Navbar user={null} />

            {/* ══════════════════════════════════════════════════════════════ */}
            {/*  HERO                                                         */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
                {/* Ambient glows */}
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/[0.07] rounded-full blur-[150px] animate-glow-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.05] rounded-full blur-[150px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[200px]" />
                </div>

                {/* Grid lines (subtle) */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '80px 80px',
                    }} />
                </div>

                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                    className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-8"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 text-sm font-medium backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Now in beta &mdash; Join a growing community of readers
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="font-display text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight mb-6"
                    >
                        Your midnight
                        <br />
                        <span className="gradient-text">library</span>{' '}
                        <span className="font-serif italic font-normal text-white/80">awaits</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                        className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Track your reading, join vibrant book clubs, and discover your next
                        obsession. A community built for people who live inside stories.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
                    >
                        <Link
                            href="/auth/signup"
                            className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-base group"
                        >
                            Start Reading Free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            href="#features"
                            className="w-full sm:w-auto btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
                        >
                            See how it works
                        </Link>
                    </motion.div>

                    {/* Social proof */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 1.2 }}
                        className="mt-12 flex items-center justify-center gap-3"
                    >
                        <div className="flex -space-x-2">
                            {['S', 'M', 'P', 'A', 'R'].map((letter, i) => (
                                <div
                                    key={letter}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30 border-2 border-midnight flex items-center justify-center text-xs font-bold text-white/70"
                                >
                                    {letter}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                        <span className="text-white/40 text-sm">Built for book lovers</span>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5"
                    >
                        <div className="w-1 h-2 rounded-full bg-white/40" />
                    </motion.div>
                </motion.div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/*  BOOK MARQUEE                                                 */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-20 overflow-hidden relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-midnight to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-midnight to-transparent z-10" />

                <AnimatedSection className="text-center mb-10">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-display font-semibold">
                        Readers are tracking
                    </p>
                </AnimatedSection>

                {/* Row 1 */}
                <div className="flex gap-4 animate-marquee mb-4">
                    {[...BOOK_COVERS, ...BOOK_COVERS].map((book, i) => (
                        <div
                            key={`r1-${i}`}
                            className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[130px] aspect-[2/3] rounded-lg overflow-hidden book-shadow group cursor-pointer"
                        >
                            <img
                                src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`}
                                alt={book.title}
                                className="w-full h-full object-cover bg-midnight-300 group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>

                {/* Row 2 (reversed) */}
                <div className="flex gap-4 animate-marquee-reverse">
                    {[...BOOK_COVERS.slice().reverse(), ...BOOK_COVERS.slice().reverse()].map((book, i) => (
                        <div
                            key={`r2-${i}`}
                            className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[130px] aspect-[2/3] rounded-lg overflow-hidden book-shadow group cursor-pointer"
                        >
                            <img
                                src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`}
                                alt={book.title}
                                className="w-full h-full object-cover bg-midnight-300 group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/*  STATS BAR                                                    */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section className="border-y border-white/[0.04] bg-surface/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4">
                        {STATS.map((stat, i) => (
                            <AnimatedSection
                                key={stat.label}
                                delay={i * 0.1}
                                className={`py-10 md:py-12 text-center ${i < 3 ? 'border-r border-white/[0.04]' : ''} ${i < 2 ? 'border-b md:border-b-0 border-white/[0.04]' : ''}`}
                            >
                                <p className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-white/30 text-xs sm:text-sm font-medium tracking-wider uppercase">
                                    {stat.label}
                                </p>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/*  FEATURES                                                     */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section id="features" className="section-padding">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <AnimatedSection className="text-center mb-16">
                        <SectionBadge icon={Zap} label="Features" />
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-5 mb-4">
                            Everything a reader{' '}
                            <span className="font-serif italic font-normal text-amber-400">needs</span>
                        </h2>
                        <p className="text-white/40 text-lg max-w-xl mx-auto">
                            Built by readers, for readers. Every feature designed to deepen
                            your love of books.
                        </p>
                    </AnimatedSection>

                    <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                        {FEATURES.map((feature, i) => (
                            <AnimatedSection key={feature.title} delay={i * 0.1}>
                                <div className="glass-hover group p-6 sm:p-8 h-full">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/40 leading-relaxed text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/*  READING STATS SHOWCASE                                       */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section className="section-padding relative">
                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/[0.04] rounded-full blur-[150px]" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Copy */}
                        <AnimatedSection>
                            <SectionBadge icon={BarChart3} label="Analytics" />
                            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-5 mb-5">
                                Your reading,{' '}
                                <span className="font-serif italic font-normal text-amber-400">visualized</span>
                            </h2>
                            <p className="text-white/40 text-lg mb-8 leading-relaxed">
                                Set goals, build streaks, and watch your library grow. Beautiful
                                charts and insights that make reading feel like a game.
                            </p>

                            <div className="space-y-5">
                                {[
                                    { icon: Target, title: 'Annual reading goals', desc: 'Set targets and crush them with visual milestones.', color: 'text-amber-400' },
                                    { icon: Flame, title: 'Daily reading streaks', desc: 'Build consistency. Earn badges for your dedication.', color: 'text-rose-400' },
                                    { icon: TrendingUp, title: 'Pages & time analytics', desc: 'Beautiful charts showing your monthly reading pace.', color: 'text-violet-400' },
                                ].map((item) => (
                                    <div key={item.title} className="flex items-start gap-4 group">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
                                            <item.icon className={`w-5 h-5 ${item.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-white mb-0.5 text-sm">
                                                {item.title}
                                            </h3>
                                            <p className="text-white/35 text-sm">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AnimatedSection>

                        {/* Stats card */}
                        <AnimatedSection delay={0.2} className="relative">
                            <div className="glass p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-display text-lg font-bold text-white">Your Dashboard</h3>
                                        <p className="text-white/30 text-sm">Preview</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                                        <span className="text-amber-400 text-xs font-bold font-display">Streaks</span>
                                    </div>
                                </div>

                                {/* Bar chart */}
                                <div className="flex items-end gap-1.5 h-32 mb-6">
                                    {[35, 55, 40, 72, 65, 85, 90, 60, 78, 50, 88, 45].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
                                            className="flex-1 flex flex-col items-center gap-1"
                                        >
                                            <div
                                                className={`w-full rounded-t-sm ${i === 6 ? 'bg-amber-500' : 'bg-white/10'} hover:bg-amber-500/60 transition-colors duration-200`}
                                                style={{ height: '100%' }}
                                            />
                                            <span className="text-[9px] text-white/25 font-medium">
                                                {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: '47', label: 'Books', color: 'text-white' },
                                        { value: '12.8K', label: 'Pages', color: 'text-white' },
                                        { value: '95%', label: 'Goal', color: 'text-amber-400' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="text-center p-3 rounded-xl bg-white/[0.03]">
                                            <p className={`font-display text-xl font-bold ${stat.color}`}>{stat.value}</p>
                                            <p className="text-white/25 text-xs">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Floating badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="absolute -top-4 -right-4 glass px-4 py-2.5 flex items-center gap-2"
                            >
                                <Heart className="w-4 h-4 text-rose-400" />
                                <div>
                                    <p className="text-[10px] text-white/30">Favorite</p>
                                    <p className="text-xs font-bold text-white">Literary Fiction</p>
                                </div>
                            </motion.div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/*  AI DISCOVERY                                                 */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section className="section-padding relative">
                <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-500/[0.04] rounded-full blur-[150px]" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* AI card */}
                        <AnimatedSection className="order-2 lg:order-1 relative">
                            <div className="glass overflow-hidden">
                                <div className="p-6 sm:p-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-display font-semibold text-white/60">AI Discovery</span>
                                    </div>

                                    <p className="text-white/30 text-sm mb-5 font-serif italic">
                                        &ldquo;I just finished Pachinko and loved the multi-generational storytelling...&rdquo;
                                    </p>

                                    <div className="space-y-2.5">
                                        {[
                                            { title: 'The Sympathizer', author: 'Viet Thanh Nguyen', tag: 'Similar themes' },
                                            { title: 'A Little Life', author: 'Hanya Yanagihara', tag: 'Epic scope' },
                                            { title: 'Homegoing', author: 'Yaa Gyasi', tag: 'Generational' },
                                        ].map((rec) => (
                                            <div key={rec.title} className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] rounded-xl px-4 py-3 transition-colors group cursor-pointer">
                                                <div>
                                                    <p className="font-semibold text-sm text-white group-hover:text-amber-400 transition-colors">{rec.title}</p>
                                                    <p className="text-xs text-white/30">{rec.author}</p>
                                                </div>
                                                <span className="text-xs font-bold font-display text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                                                    {rec.tag}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom bar */}
                                <div className="px-6 sm:px-8 py-4 border-t border-white/[0.04] flex items-center gap-2 text-xs text-white/25">
                                    <Sparkles className="w-3 h-3 text-violet-400" />
                                    Powered by AI &mdash; Based on your reading DNA
                                </div>
                            </div>
                        </AnimatedSection>

                        {/* Copy */}
                        <AnimatedSection className="order-1 lg:order-2" delay={0.1}>
                            <SectionBadge icon={Sparkles} label="Discovery" variant="violet" />
                            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-5 mb-5">
                                AI that{' '}
                                <span className="font-serif italic font-normal text-violet-400">gets</span>{' '}
                                your taste
                            </h2>
                            <p className="text-white/40 text-lg mb-6 leading-relaxed">
                                Tell us your mood, your favorite book, or what you&apos;re craving.
                                Our AI finds your next obsession from millions of titles.
                            </p>
                            <Link
                                href="/discover"
                                className="btn-accent inline-flex items-center gap-2 group"
                            >
                                Try AI Discovery
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/*  BOOK CLUBS                                                   */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section id="clubs" className="section-padding">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <AnimatedSection className="text-center mb-14">
                        <SectionBadge icon={Users} label="Community" variant="emerald" />
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-5 mb-4">
                            Read together,{' '}
                            <span className="font-serif italic font-normal text-emerald-400">grow together</span>
                        </h2>
                        <p className="text-white/40 text-lg max-w-xl mx-auto">
                            Join vibrant book clubs. Discuss weekly. Make lifelong friends
                            who love the same stories.
                        </p>
                    </AnimatedSection>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {CLUBS.map((club, i) => (
                            <AnimatedSection key={club.name} delay={i * 0.08}>
                                <div className={`glass-hover group p-5 h-full ${club.borderGlow}`}>
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${club.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className="relative z-10">
                                        <h3 className="font-display text-base font-bold text-white mb-1">
                                            {club.name}
                                        </h3>
                                        <p className="text-white/30 text-xs mb-4">
                                            {club.tagline}
                                        </p>
                                        <div className="bg-white/[0.03] rounded-lg px-3 py-2.5 border border-white/[0.04]">
                                            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Reading now</p>
                                            <p className="text-xs font-medium text-white/70 truncate">{club.currentBook}</p>
                                        </div>
                                        <Link
                                            href="/auth/signup"
                                            className="mt-4 inline-flex items-center gap-1 text-xs font-display font-semibold text-white/40 hover:text-amber-400 transition-colors group/link"
                                        >
                                            Join club
                                            <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/*  TESTIMONIALS                                                 */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section className="section-padding border-t border-white/[0.04]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <AnimatedSection className="text-center mb-14">
                        <SectionBadge icon={Heart} label="Love Letters" />
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-5 mb-4">
                            Readers{' '}
                            <span className="font-serif italic font-normal text-amber-400">love</span>{' '}
                            ApicBooks
                        </h2>
                    </AnimatedSection>

                    <div className="grid md:grid-cols-3 gap-4 md:gap-5">
                        {TESTIMONIALS.map((t, i) => (
                            <AnimatedSection key={t.name} delay={i * 0.1}>
                                <div className="glass-hover p-6 h-full flex flex-col">
                                    <div className="flex gap-0.5 mb-4">
                                        {[...Array(t.stars)].map((_, j) => (
                                            <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-white/60 text-sm leading-relaxed mb-6 flex-1 font-serif italic">
                                        {t.text}
                                    </p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-violet-500/20 flex items-center justify-center text-xs font-bold text-white/60">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{t.name}</p>
                                            <p className="text-xs text-white/30">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/*  CTA                                                          */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section className="section-padding relative">
                <div className="absolute inset-0 bg-hero-mesh" />

                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <AnimatedSection>
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
                            Ready to start{' '}
                            <span className="font-serif italic font-normal text-amber-400">reading</span>?
                        </h2>
                        <p className="text-white/40 text-lg mb-8 max-w-lg mx-auto">
                            Join a growing community of readers who track, discover,
                            and discuss books on ApicBooks. Always free.
                        </p>
                        <Link
                            href="/auth/signup"
                            className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base group"
                        >
                            Create Your Library
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </AnimatedSection>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/*  FOOTER                                                       */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <footer className="border-t border-white/[0.04] py-12 md:py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <Link href="/" className="font-display text-xl font-extrabold text-white tracking-tight">
                                ApicBooks
                            </Link>
                            <p className="text-white/25 text-sm mt-3 leading-relaxed">
                                Your midnight library.<br />
                                Built for readers, by readers.
                            </p>
                        </div>
                        {[
                            {
                                title: 'Product',
                                links: [
                                    { label: 'Features', href: '/features' },
                                    { label: 'Discover', href: '/discover' },
                                    { label: 'Book Clubs', href: '/clubs' },
                                    { label: 'Pricing', href: '#' },
                                ],
                            },
                            {
                                title: 'Company',
                                links: [
                                    { label: 'About', href: '/about' },
                                    { label: 'Blog', href: '#' },
                                    { label: 'Contact', href: '/contact' },
                                    { label: 'Careers', href: '#' },
                                ],
                            },
                            {
                                title: 'Legal',
                                links: [
                                    { label: 'Privacy', href: '/privacy' },
                                    { label: 'Terms', href: '/terms' },
                                    { label: 'Cookies', href: '#' },
                                ],
                            },
                        ].map((col) => (
                            <div key={col.title}>
                                <h4 className="font-display text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
                                    {col.title}
                                </h4>
                                <ul className="space-y-2.5">
                                    {col.links.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href} className="text-sm text-white/30 hover:text-amber-400 transition-colors">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-white/20 text-xs">&copy; 2026 ApicBooks. All rights reserved.</p>
                        <p className="text-white/15 text-xs">Made with care for book lovers everywhere.</p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
