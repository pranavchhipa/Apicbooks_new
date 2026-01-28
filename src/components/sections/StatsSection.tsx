'use client';

import Counter from '@/components/ui/Counter';
import { BookOpen, Users, DollarSign, Globe } from 'lucide-react';

const stats = [
    {
        icon: BookOpen,
        value: 10000000,
        suffix: '+',
        label: 'Books Searched',
        color: 'from-primary-500 to-primary-600'
    },
    {
        icon: Users,
        value: 500000,
        suffix: '+',
        label: 'Happy Readers',
        color: 'from-secondary-500 to-secondary-600'
    },
    {
        icon: DollarSign,
        value: 2000000,
        suffix: '+',
        label: 'Saved by Users',
        color: 'from-emerald-500 to-emerald-600'
    },
    {
        icon: Globe,
        value: 150,
        suffix: '+',
        label: 'Retailers Compared',
        color: 'from-accent-500 to-accent-600'
    }
];

export default function StatsSection() {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 hero-gradient-mesh opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        Trusted by <span className="gradient-text">Book Lovers</span> Worldwide
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Join millions of readers who save money on their book purchases every day.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="card-hover p-6 md:p-8 text-center group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={`
                                w-14 h-14 mx-auto mb-4 rounded-2xl 
                                bg-gradient-to-br ${stat.color}
                                flex items-center justify-center
                                shadow-lg group-hover:shadow-xl transition-shadow
                                group-hover:scale-110 transition-transform duration-300
                            `}>
                                <stat.icon className="w-7 h-7 text-white" />
                            </div>
                            <div className="stat-value text-3xl md:text-4xl">
                                <Counter
                                    end={stat.value}
                                    suffix={stat.suffix}
                                    duration={2500}
                                />
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
