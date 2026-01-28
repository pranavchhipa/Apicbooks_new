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
        color: "text-purple-400",
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
        <section id="community" className="py-32 bg-slate-950 overflow-hidden relative">

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
                            <div className={`p-3 rounded-2xl bg-slate-800/50 w-fit mb-6 border border-slate-700/50 ${feature.color}`}>
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-400 mb-2 uppercase tracking-wide">{feature.title}</h3>
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                                {feature.heading}
                            </h2>
                            <p className="text-lg text-slate-400 leading-relaxed mb-8">
                                {feature.description}
                            </p>

                            <div className="flex gap-8 border-t border-slate-800 pt-8">
                                {feature.stats.map((stat) => (
                                    <div key={stat.label}>
                                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                                        <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
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
                            <div className="relative rounded-2xl bg-slate-900 border border-slate-700/50 shadow-2xl shadow-primary-500/10 overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

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
