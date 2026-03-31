'use client';

import { motion } from 'framer-motion';
import {
    Library,
    TrendingUp,
    MessageSquare,
    Search,
    ArrowUpRight
} from 'lucide-react';

const features = [
    {
        title: "Track Your Progress",
        description: "Visualize your reading journey with detailed stats. Track pages read, books finished, and maintain your reading streak.",
        icon: Library,
        className: "md:col-span-2 bg-gradient-to-br from-[#7c5cfc]/8 dark:from-[#9b7aff]/10 to-transparent border-[#7c5cfc]/20",
        iconColor: "text-[#7c5cfc] dark:text-[#9b7aff]"
    },
    {
        title: "Compare Prices",
        description: "Save money on every purchase. We compare prices across major retailers like Amazon, eBay, and more to find you the best deal.",
        icon: TrendingUp,
        className: "md:col-span-2 bg-gradient-to-br from-emerald-500/8 dark:from-emerald-500/10 to-transparent border-emerald-500/20",
        iconColor: "text-emerald-500 dark:text-emerald-400"
    },
    {
        title: "Community Reviews",
        description: "Join a vibrant community of readers. Share your thoughts, write reviews, and see what others are saying about your next read.",
        icon: MessageSquare,
        className: "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#e8914f]/8 dark:from-[#f0a45d]/10 to-transparent border-[#e8914f]/20",
        iconColor: "text-[#e8914f] dark:text-[#f0a45d]"
    },
    {
        title: "Mood Search",
        description: "Find exactly what you're looking for. Search by mood, genre, or vibe to discover your next favorite book.",
        icon: Search,
        className: "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-purple-500/8 dark:from-purple-500/10 to-transparent border-purple-500/20",
        iconColor: "text-purple-500 dark:text-purple-400"
    }
];

export default function FeaturesGrid() {
    return (
        <section id="features" className="py-24 bg-white dark:bg-[#0c0a14] px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-[#2c1810] dark:text-[#f5f0eb] mb-6">
                        Powerful Tools for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c5cfc] to-[#e8914f]">
                            Avid Readers
                        </span>
                    </h2>
                    <p className="text-[#8b7355] dark:text-[#a39484] text-lg max-w-2xl mx-auto">
                        Everything you need to organize your library, save money, and connect with other book lovers.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`group relative p-8 rounded-3xl border border-[#e0d5c7] dark:border-[#2d2545] backdrop-blur-sm hover:border-[#d6cec3] dark:hover:border-[#3d3560] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden ${feature.className}`}
                        >
                            <div className={`p-3 rounded-2xl bg-[#f3efe8] dark:bg-[#0c0a14]/50 w-fit mb-6 border border-[#e0d5c7]/50 dark:border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                            </div>

                            <h3 className="text-xl font-bold text-[#2c1810] dark:text-[#f5f0eb] mb-3 group-hover:text-[#7c5cfc] dark:group-hover:text-[#9b7aff] transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-[#8b7355] dark:text-[#a39484] leading-relaxed">
                                {feature.description}
                            </p>

                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                <ArrowUpRight className="w-5 h-5 text-[#8b7355] dark:text-[#a39484]" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
