'use client';

import { X, Search, Sparkles, BookOpen, TrendingUp, DollarSign, Users, Trophy } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

interface FeaturesGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FeaturesGuideModal({ isOpen, onClose }: FeaturesGuideModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Center alignment handled by fixed inset-0 flex items-center justify-center
    // But sometimes margin-auto is safer if content is small
    if (!isOpen || !mounted) return null;

    const features = [
        {
            icon: DollarSign,
            title: "Smart Price Comparison",
            desc: "We scan major retailers like Amazon, Flipkart, and Google Books to find you the absolute lowest price instantly.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Sparkles,
            title: "AI Mood Match",
            desc: "Tell Anika (our AI) exactly what you're in the mood for—'cozy mystery in London'—and get perfect recommendations.",
            color: "text-accent-400",
            bg: "bg-accent-500/10"
        },
        {
            icon: BookOpen,
            title: "Universal Library",
            desc: "Track your entire collection. Physical books, E-books, Audiobooks, and Wishlist—all organized in one shelf.",
            color: "text-primary-400",
            bg: "bg-primary-500/10"
        },
        {
            icon: TrendingUp,
            title: "Reading Insights",
            desc: "Visualize your progress. Track daily streaks, reading speed, and hit your annual reading goals.",
            color: "text-amber-400",
            bg: "bg-amber-500/10"
        },
        {
            icon: Trophy,
            title: "Gamified Levels",
            desc: "Earn XP for every page. Climb the ranks from Beginner to Scholar as you build your reading habit.",
            color: "text-rose-400",
            bg: "bg-rose-500/10"
        },
        {
            icon: Users,
            title: "Social Feed",
            desc: "Connect with friends, see what they're reading, and share your latest literary discoveries.",
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        }
    ];

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl bg-secondary dark:bg-[#0c0a14] border border-card-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] relative animate-scale-in"
                onClick={e => e.stopPropagation()}
            >

                {/* Hero Header */}
                <div className="relative h-48 bg-gradient-to-br from-primary-900 via-[#0a0e27] to-[#0a0e27] flex items-center px-10 border-b border-card-border shrink-0">
                    <div className="absolute inset-0 bg-grid-white/[0.05]" />
                    {/* Decorative glows */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/20 blur-3xl rounded-full" />

                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-4xl font-display font-bold text-foreground mb-3">Welcome to ApicBooks</h2>
                        <p className="text-lg text-foreground/80">Your intelligent reading companion. Explore all the features designed to help you read more and read better.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-white/10 rounded-full text-foreground/50 hover:text-foreground transition-colors z-20"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar">
                    {features.map((f, i) => (
                        <div key={i} className="flex flex-col gap-4 p-5 rounded-2xl hover:bg-[#141b3d]/50 transition-all duration-300 border border-transparent hover:border-card-border group hover:-translate-y-1">
                            <div className={`p-4 w-fit rounded-xl ${f.bg} ${f.color} group-hover:scale-110 transition-transform shadow-lg shadow-black/20`}>
                                <f.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-foreground mb-2">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-card-border bg-[#0d1233] flex justify-between items-center shrink-0">
                    <p className="text-xs text-slate-500">You can open this guide anytime from the top bar.</p>
                    <button onClick={onClose} className="btn-primary px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/20">
                        Get Started
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
