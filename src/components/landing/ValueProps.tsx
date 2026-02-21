'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, Users, Library, Sparkles, BarChart3 } from 'lucide-react';

const features = [
    {
        title: "AI-Powered Discovery",
        heading: "Next-Gen Recommendations",
        description: "Stop scrolling and start reading. Our AI librarian 'Anika' analyzes your mood, favorite tropes, and recent reads to suggest the perfect book in seconds.",
        icon: Sparkles,
        image: "/landing-discover.png",
        color: "text-[#9b7aff]",
        stats: [
            { label: "AI Suggestions", value: "Instant" },
            { label: "Accuracy", value: "98%" },
        ]
    },
    {
        title: "Deep Analytics",
        heading: "Visualize Your Journey",
        description: "Track more than just page counts. Get deep insights into your reading habits with beautiful interactive charts, yearly goals, and reading streaks.",
        icon: BarChart3,
        image: "/landing-stats.png",
        color: "text-emerald-400",
        stats: [
            { label: "Visual Charts", value: "Interactive" },
            { label: "Goal Tracking", value: "Real-time" },
        ]
    }
];

export default function ValueProps() {
    return (
        <section id="community" className="py-32 bg-[#f3efe8] dark:bg-[#0c0a14] overflow-hidden relative">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
                {features.map((feature, index) => (
                    <div key={feature.title} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}>

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: index % 2 === 1 ? 20 : -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex-1"
                        >
                            <div className={`p-3 rounded-2xl bg-white/60 dark:bg-[#241e36]/50 w-fit mb-6 border border-[#e0d5c7] dark:border-[#2d2545]/50 ${feature.color}`}>
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-medium text-[#8b7355] dark:text-[#a39484] mb-2 uppercase tracking-wide">{feature.title}</h3>
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-[#2c1810] dark:text-[#f5f0eb] mb-6 leading-tight">
                                {feature.heading}
                            </h2>
                            <p className="text-lg text-[#8b7355] dark:text-[#a39484] leading-relaxed mb-8">
                                {feature.description}
                            </p>

                            <div className="flex gap-8 border-t border-[#e0d5c7] dark:border-[#2d2545] pt-8">
                                {feature.stats.map((stat) => (
                                    <div key={stat.label}>
                                        <div className="text-2xl font-bold text-[#2c1810] dark:text-[#f5f0eb] mb-1">{stat.value}</div>
                                        <div className="text-sm text-[#a39484] dark:text-[#8b7355] font-medium">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Image Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="flex-1 w-full"
                        >
                            <div className="relative rounded-2xl bg-white dark:bg-[#1a1528] border border-[#e0d5c7] dark:border-[#2d2545]/50 shadow-2xl shadow-[#7c5cfc]/5 dark:shadow-[#9b7aff]/10 overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#7c5cfc]/5 dark:from-[#9b7aff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

                                <Image
                                    src={feature.image}
                                    alt={feature.heading}
                                    width={800}
                                    height={600}
                                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>
        </section>
    );
}
