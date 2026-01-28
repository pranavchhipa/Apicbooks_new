'use client';

import { BookOpen, Target, Heart, Lightbulb, Users, Rocket, Mail, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

const values = [
    {
        icon: Target,
        title: 'Transparency',
        description: 'We show you real prices from real retailers with no hidden fees or biased rankings.',
        color: 'from-primary-500 to-primary-600'
    },
    {
        icon: Heart,
        title: 'Accessibility',
        description: 'Books should be affordable for everyone. We help you find the best deals, every time.',
        color: 'from-secondary-500 to-secondary-600'
    },
    {
        icon: Lightbulb,
        title: 'Innovation',
        description: 'Our AI-powered search helps you discover books based on mood, theme, or feeling.',
        color: 'from-accent-500 to-accent-600'
    },
    {
        icon: Users,
        title: 'Community',
        description: 'Built by book lovers, for book lovers. Your feedback shapes our product.',
        color: 'from-purple-500 to-purple-600'
    }
];

const team = [
    { name: 'Alex Rivera', role: 'Founder & CEO', avatar: '👨‍💻', bio: 'Former Amazon engineer with a passion for making books accessible.' },
    { name: 'Sarah Kim', role: 'CTO', avatar: '👩‍💻', bio: 'ML specialist who built our AI recommendation engine.' },
    { name: 'Marcus Johnson', role: 'Head of Product', avatar: '👨‍🎨', bio: 'UX designer focused on making book discovery delightful.' },
    { name: 'Emily Chen', role: 'Head of Partnerships', avatar: '👩‍💼', bio: 'Building relationships with retailers worldwide.' },
];

const timeline = [
    { year: '2023', title: 'The Beginning', description: 'BookScanner was founded with a simple mission: help readers find affordable books.' },
    { year: '2024', title: 'AI Launch', description: 'Introduced mood-based search powered by AI, revolutionizing book discovery.' },
    { year: '2025', title: 'Global Expansion', description: 'Expanded to 50+ countries with 150+ retailer partnerships.' },
    { year: '2026', title: 'Community First', description: 'Launched wishlist features and price alerts based on user feedback.' },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 hero-pattern" />
                <div className="orb-container">
                    <div className="orb orb-1" />
                    <div className="orb orb-2" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <span className="badge-primary mb-4 inline-block">About Us</span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
                        Making Books{' '}
                        <span className="gradient-text">Accessible</span> to Everyone
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        We believe everyone deserves access to great literature without breaking the bank.
                        BookScanner helps you find the best prices across hundreds of retailers.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 section-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="badge-secondary mb-4">Our Mission</span>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                                Empowering Readers Worldwide
                            </h2>
                            <p className="text-slate-300 mb-6">
                                In a world where book prices vary dramatically across retailers, we saw an opportunity
                                to level the playing field. BookScanner was born from frustration—spending hours
                                comparing prices across websites just to find a good deal.
                            </p>
                            <p className="text-slate-300 mb-6">
                                Today, we're proud to help millions of readers save time and money. Our AI-powered
                                platform searches across 150+ retailers in seconds, ensuring you always get the best
                                price for your next read.
                            </p>
                            <div className="flex items-center gap-4">
                                <Link href="/contact" className="btn-primary">
                                    Get in Touch
                                </Link>
                                <Link href="/features" className="btn-secondary">
                                    See Features
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {values.map((value, index) => (
                                <div
                                    key={value.title}
                                    className="card-hover p-6"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4`}>
                                        <value.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-2">{value.title}</h3>
                                    <p className="text-slate-400 text-sm">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20" id="team">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="badge-primary mb-4">Our Team</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            Meet the <span className="gradient-text">Bookworms</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            A passionate team of readers, engineers, and designers united by our love for books.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member, index) => (
                            <div
                                key={member.name}
                                className="card-hover text-center p-6 group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
                                    {member.avatar}
                                </div>
                                <h3 className="text-white font-semibold text-lg">{member.name}</h3>
                                <p className="text-primary-400 text-sm mb-3">{member.role}</p>
                                <p className="text-slate-400 text-sm">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-20 section-dark" id="history">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="badge-secondary mb-4">Our Journey</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            From Idea to <span className="gradient-text">Reality</span>
                        </h2>
                    </div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500 via-secondary-500 to-accent-500" />

                        <div className="space-y-12">
                            {timeline.map((item, index) => (
                                <div
                                    key={item.year}
                                    className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                        }`}
                                >
                                    {/* Dot */}
                                    <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary-500 border-4 border-slate-900" />

                                    {/* Content */}
                                    <div className={`flex-1 pl-8 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                                        <div className="card p-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-4 h-4 text-primary-400" />
                                                <span className="text-primary-400 font-bold">{item.year}</span>
                                            </div>
                                            <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                                            <p className="text-slate-400">{item.description}</p>
                                        </div>
                                    </div>

                                    {/* Spacer for alternating layout */}
                                    <div className="flex-1 hidden md:block" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="card glass-accent p-12">
                        <Rocket className="w-16 h-16 text-primary-400 mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            Join Our Mission
                        </h2>
                        <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                            We're always looking for passionate people to join our team.
                            Help us make books accessible to everyone.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/contact" className="btn-primary flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Contact Us
                            </Link>
                            <a href="#careers" className="btn-secondary flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                View Careers
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
