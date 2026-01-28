'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ChevronDown, ChevronUp, Twitter, Github, Linkedin } from 'lucide-react';

const contactInfo = [
    {
        icon: Mail,
        label: 'Email',
        value: 'hello@bookscanner.com',
        href: 'mailto:hello@bookscanner.com',
        color: 'from-primary-500 to-primary-600'
    },
    {
        icon: Phone,
        label: 'Phone',
        value: '+1 (555) 123-4567',
        href: 'tel:+15551234567',
        color: 'from-secondary-500 to-secondary-600'
    },
    {
        icon: MapPin,
        label: 'Office',
        value: 'San Francisco, CA',
        href: '#',
        color: 'from-accent-500 to-accent-600'
    },
    {
        icon: Clock,
        label: 'Response Time',
        value: 'Within 24 hours',
        href: '#',
        color: 'from-emerald-500 to-emerald-600'
    }
];

const faqs = [
    {
        question: 'How does BookScanner compare prices?',
        answer: 'We search across 150+ retailers in real-time to find the best prices for both new and used books. Our system updates prices regularly to ensure accuracy.'
    },
    {
        question: 'Is BookScanner free to use?',
        answer: 'Yes! BookScanner is completely free for all users. We earn a small commission from retailers when you make a purchase through our links, at no extra cost to you.'
    },
    {
        question: 'How does the AI mood search work?',
        answer: 'Our AI analyzes your mood description and matches it with book themes, genres, and reader reviews to recommend titles that fit how you\'re feeling.'
    },
    {
        question: 'Can I track price changes for specific books?',
        answer: 'Yes! Create a free account and add books to your wishlist. We\'ll notify you when prices drop on your saved items.'
    },
    {
        question: 'Which retailers do you compare?',
        answer: 'We compare prices from major retailers including Amazon, eBay, AbeBooks, ThriftBooks, Barnes & Noble, Better World Books, and 100+ more.'
    },
    {
        question: 'How do I report an incorrect price?',
        answer: 'Use the contact form below or email us directly. We take accuracy seriously and will investigate all reports promptly.'
    }
];

const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSubmitted(true);
        setIsSubmitting(false);
        setFormData({ name: '', email: '', subject: '', message: '' });

        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 hero-pattern" />
                <div className="orb-container">
                    <div className="orb orb-1" />
                    <div className="orb orb-3" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <span className="badge-primary mb-4 inline-block">Contact Us</span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Have questions, feedback, or just want to say hi?
                        We'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12 -mt-10 relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {contactInfo.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="card-hover p-6 text-center group"
                            >
                                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-7 h-7 text-white" />
                                </div>
                                <p className="text-slate-400 text-sm mb-1">{item.label}</p>
                                <p className="text-white font-medium">{item.value}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & FAQ */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-primary-500/20">
                                    <MessageSquare className="w-6 h-6 text-primary-400" />
                                </div>
                                <h2 className="text-2xl font-display font-bold text-white">Send a Message</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input-field"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        id="subject"
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="input-field"
                                        placeholder="How can we help?"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="input-field min-h-[150px] resize-y"
                                        placeholder="Tell us more..."
                                        required
                                    />
                                </div>

                                {submitted && (
                                    <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 animate-fade-in">
                                        Thanks for your message! We'll get back to you soon.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                                <p className="text-slate-400 text-sm mb-4">Or connect with us on social media</p>
                                <div className="flex items-center justify-center gap-4">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
                                            aria-label={social.label}
                                        >
                                            <social.icon className="w-6 h-6" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div id="faq">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-secondary-500/20">
                                    <MessageSquare className="w-6 h-6 text-secondary-400" />
                                </div>
                                <h2 className="text-2xl font-display font-bold text-white">Frequently Asked Questions</h2>
                            </div>

                            <div className="space-y-3">
                                {faqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="card overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                            className="w-full flex items-center justify-between p-4 text-left"
                                        >
                                            <span className="text-white font-medium pr-4">{faq.question}</span>
                                            {openFaq === index ? (
                                                <ChevronUp className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            )}
                                        </button>
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                        >
                                            <p className="px-4 pb-4 text-slate-400">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
