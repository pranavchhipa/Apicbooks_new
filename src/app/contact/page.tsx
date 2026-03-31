'use client';

import { useState, useRef } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ChevronDown, ChevronUp, Twitter, Github, Linkedin } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';

const contactInfo = [
    {
        icon: Mail,
        label: 'Email',
        value: 'hello@apicbooks.com',
        href: 'mailto:hello@apicbooks.com',
        gradient: 'from-amber-500/20 to-amber-600/5',
        iconColor: 'text-amber-400',
    },
    {
        icon: Phone,
        label: 'Phone',
        value: '+1 (555) 123-4567',
        href: 'tel:+15551234567',
        gradient: 'from-violet-500/20 to-violet-600/5',
        iconColor: 'text-violet-400',
    },
    {
        icon: MapPin,
        label: 'Office',
        value: 'San Francisco, CA',
        href: '#',
        gradient: 'from-emerald-500/20 to-emerald-600/5',
        iconColor: 'text-emerald-400',
    },
    {
        icon: Clock,
        label: 'Response Time',
        value: 'Within 24 hours',
        href: '#',
        gradient: 'from-rose-500/20 to-rose-600/5',
        iconColor: 'text-rose-400',
    },
];

const faqs = [
    {
        question: 'How does ApicBooks compare prices?',
        answer: 'We search across multiple retailers in real-time to find the best prices for both new and used books. Our system updates prices regularly to ensure accuracy.',
    },
    {
        question: 'Is ApicBooks free to use?',
        answer: "Yes! ApicBooks is completely free for all users. We earn a small commission from retailers when you make a purchase through our links, at no extra cost to you.",
    },
    {
        question: 'How does the AI mood search work?',
        answer: "Our AI analyzes your mood description and matches it with book themes, genres, and reader reviews to recommend titles that fit how you're feeling.",
    },
    {
        question: 'Can I track price changes for specific books?',
        answer: "Yes! Create a free account and add books to your wishlist. We'll notify you when prices drop on your saved items.",
    },
    {
        question: 'Which retailers do you compare?',
        answer: 'We compare prices from major retailers including Amazon, eBay, AbeBooks, ThriftBooks, Barnes & Noble, Better World Books, and more.',
    },
    {
        question: 'How do I report an incorrect price?',
        answer: 'Use the contact form on this page or email us directly. We take accuracy seriously and will investigate all reports promptly.',
    },
];

const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSubmitted(true);
        setIsSubmitting(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="min-h-screen bg-midnight">
            <Navbar user={null} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber-500/[0.06] blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/60 text-sm font-medium mb-6 backdrop-blur-xl">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                            <span>Contact Us</span>
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.1}>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
                            Get in <span className="font-serif italic text-amber-400">Touch</span>
                        </h1>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto font-sans">
                            Have questions, feedback, or just want to say hi? We would love to hear from you.
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="pb-12 -mt-4 relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {contactInfo.map((item, index) => (
                            <FadeIn key={item.label} delay={index * 0.08}>
                                <a
                                    href={item.href}
                                    className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 text-center group hover:bg-white/[0.05] transition-all duration-300 block"
                                >
                                    <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${item.gradient} border border-white/[0.06] flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                                    </div>
                                    <p className="text-white/40 text-sm mb-1">{item.label}</p>
                                    <p className="text-white font-medium">{item.value}</p>
                                </a>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & FAQ */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <FadeIn>
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <MessageSquare className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <h2 className="font-display text-2xl font-extrabold text-white">Send a Message</h2>
                                </div>

                                <form onSubmit={handleSubmit} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-white/60 mb-2">
                                                Your Name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all"
                                                placeholder="john@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-white/60 mb-2">
                                            Subject
                                        </label>
                                        <input
                                            id="subject"
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all"
                                            placeholder="How can we help?"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-white/60 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all min-h-[150px] resize-y"
                                            placeholder="Tell us more..."
                                            required
                                        />
                                    </div>

                                    {submitted && (
                                        <div className="p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                                            Thanks for your message! We will get back to you soon.
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-black font-semibold hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Social Links */}
                                <div className="mt-8 text-center">
                                    <p className="text-white/30 text-sm mb-4 font-sans">Or connect with us on social media</p>
                                    <div className="flex items-center justify-center gap-4">
                                        {socialLinks.map((social) => (
                                            <a
                                                key={social.label}
                                                href={social.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:text-white transition-all duration-200"
                                                aria-label={social.label}
                                            >
                                                <social.icon className="w-5 h-5" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                        {/* FAQ Section */}
                        <FadeIn delay={0.15}>
                            <div id="faq">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                        <MessageSquare className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <h2 className="font-display text-2xl font-extrabold text-white">Frequently Asked Questions</h2>
                                </div>

                                <div className="space-y-3">
                                    {faqs.map((faq, index) => (
                                        <div
                                            key={index}
                                            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden"
                                        >
                                            <button
                                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                                            >
                                                <span className="text-white font-medium pr-4">{faq.question}</span>
                                                {openFaq === index ? (
                                                    <ChevronUp className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-white/25 flex-shrink-0" />
                                                )}
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ${
                                                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                            >
                                                <p className="px-4 pb-4 text-white/40 font-sans">{faq.answer}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>
        </div>
    );
}
