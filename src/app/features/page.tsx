'use client';

import { Search, Sparkles, Bell, Heart, TrendingUp, Shield, Zap, Globe, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        icon: Search,
        title: 'Universal Search',
        description: 'Search by title, author, ISBN, or keywords across 150+ retailers simultaneously.',
        color: 'from-primary-500 to-primary-600'
    },
    {
        icon: Sparkles,
        title: 'AI Mood Discovery',
        description: 'Tell us how you\'re feeling and our AI will recommend the perfect book for your mood.',
        color: 'from-purple-500 to-purple-600'
    },
    {
        icon: TrendingUp,
        title: 'Price Comparison',
        description: 'See prices side-by-side from all major retailers. Find the best deal instantly.',
        color: 'from-emerald-500 to-emerald-600'
    },
    {
        icon: Bell,
        title: 'Price Alerts',
        description: 'Get notified when prices drop on your wishlist items. Never miss a deal.',
        color: 'from-accent-500 to-accent-600'
    },
    {
        icon: Heart,
        title: 'Smart Wishlist',
        description: 'Save books for later and track prices over time. Share lists with friends.',
        color: 'from-red-500 to-red-600'
    },
    {
        icon: Globe,
        title: 'Global Coverage',
        description: 'Compare prices from retailers worldwide. Available in 50+ countries.',
        color: 'from-secondary-500 to-secondary-600'
    }
];

const benefits = [
    'Save up to 70% on book purchases',
    'Compare new and used book prices',
    'No registration required for searches',
    'Real-time price updates',
    'Mobile-friendly experience',
    'No ads or spam'
];

const comparisons = [
    { feature: 'Number of Retailers', bookscanner: '150+', others: '10-20' },
    { feature: 'AI Recommendations', bookscanner: '✓', others: '✗' },
    { feature: 'Price Alerts', bookscanner: '✓', others: 'Limited' },
    { feature: 'Mobile App', bookscanner: 'Coming Soon', others: '✗' },
    { feature: 'Free to Use', bookscanner: '✓', others: 'Freemium' },
    { feature: 'Global Coverage', bookscanner: '50+ Countries', others: 'US Only' },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 hero-pattern" />
                <div className="orb-container">
                    <div className="orb orb-1" />
                    <div className="orb orb-2" />
                    <div className="orb orb-3" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <span className="badge-primary mb-4 inline-block">Features</span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
                        Everything You Need to{' '}
                        <span className="gradient-text">Save on Books</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                        Powerful tools to find, compare, and track book prices—all completely free.
                    </p>
                    <Link href="/" className="btn-gradient px-8 py-4 text-lg inline-flex items-center gap-2">
                        Start Searching
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Built for book lovers who want to save money without sacrificing discovery.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="card-feature"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 section-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="badge-secondary mb-4">Why Choose Us</span>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                                The Smart Way to Buy Books
                            </h2>
                            <p className="text-slate-300 mb-8">
                                Stop wasting time checking multiple websites. BookScanner does the hard work
                                so you can focus on what matters—reading great books.
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit) => (
                                    <li key={benefit} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <span className="text-slate-300">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="glass rounded-2xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary-500/20 to-transparent rounded-full blur-3xl" />

                            <div className="relative">
                                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-primary-400" />
                                    How We Compare
                                </h3>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-700">
                                                <th className="text-left py-3 text-slate-400 font-medium">Feature</th>
                                                <th className="text-center py-3 text-primary-400 font-medium">BookScanner</th>
                                                <th className="text-center py-3 text-slate-400 font-medium">Others</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisons.map((row) => (
                                                <tr key={row.feature} className="border-b border-slate-800">
                                                    <td className="py-3 text-slate-300 text-sm">{row.feature}</td>
                                                    <td className="py-3 text-center text-emerald-400 font-medium text-sm">{row.bookscanner}</td>
                                                    <td className="py-3 text-center text-slate-500 text-sm">{row.others}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="card glass-accent p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-secondary-500/20 to-transparent rounded-full blur-3xl" />

                        <div className="relative">
                            <Zap className="w-16 h-16 text-accent-400 mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                                Ready to Save Money?
                            </h2>
                            <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                                Join millions of readers who use BookScanner to find the best deals.
                                No registration required—start searching now.
                            </p>
                            <Link href="/" className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
                                Search for Books
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
