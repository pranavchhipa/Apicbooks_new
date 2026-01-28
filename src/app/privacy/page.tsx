import { Shield } from 'lucide-react';
import Link from 'next/link';

const sections = [
    { id: 'information', title: 'Information We Collect' },
    { id: 'usage', title: 'How We Use Your Information' },
    { id: 'sharing', title: 'Information Sharing' },
    { id: 'cookies', title: 'Cookies & Tracking' },
    { id: 'security', title: 'Data Security' },
    { id: 'rights', title: 'Your Rights' },
    { id: 'changes', title: 'Policy Changes' },
    { id: 'contact', title: 'Contact Us' },
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/20 mb-6">
                        <Shield className="w-8 h-8 text-primary-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-400">
                        Last updated: January 24, 2026
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Table of Contents */}
                    <nav className="lg:col-span-1">
                        <div className="sticky top-24 card p-4">
                            <h3 className="text-white font-semibold mb-4">Contents</h3>
                            <ul className="space-y-2">
                                {sections.map((section) => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            className="text-sm text-slate-400 hover:text-primary-400 transition-colors"
                                        >
                                            {section.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </nav>

                    {/* Content */}
                    <div className="lg:col-span-3 card p-8">
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 mb-8">
                                At ApicBooks, we take your privacy seriously. This Privacy Policy explains how we collect,
                                use, disclose, and safeguard your information when you use our website and services.
                            </p>

                            <section id="information" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    Information We Collect
                                </h2>
                                <p className="text-slate-300 mb-4">We may collect information about you in various ways:</p>
                                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                    <li><strong className="text-white">Personal Data:</strong> Name, email address when you create an account</li>
                                    <li><strong className="text-white">Usage Data:</strong> Search queries, pages visited, time spent on site</li>
                                    <li><strong className="text-white">Device Data:</strong> Browser type, IP address, device identifiers</li>
                                    <li><strong className="text-white">Wishlist Data:</strong> Books you save and price alerts you set</li>
                                </ul>
                            </section>

                            <section id="usage" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    How We Use Your Information
                                </h2>
                                <p className="text-slate-300 mb-4">We use the collected data for:</p>
                                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                    <li>Providing and maintaining our service</li>
                                    <li>Sending price alerts and notifications you've opted into</li>
                                    <li>Improving our search algorithms and recommendations</li>
                                    <li>Analyzing usage patterns to enhance user experience</li>
                                    <li>Communicating with you about updates and features</li>
                                </ul>
                            </section>

                            <section id="sharing" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    Information Sharing
                                </h2>
                                <p className="text-slate-300 mb-4">
                                    We do not sell your personal information. We may share data with:
                                </p>
                                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                    <li><strong className="text-white">Service Providers:</strong> Third parties that help us operate our platform</li>
                                    <li><strong className="text-white">Analytics Partners:</strong> To understand how our service is used</li>
                                    <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect rights</li>
                                </ul>
                            </section>

                            <section id="cookies" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    Cookies & Tracking
                                </h2>
                                <p className="text-slate-300 mb-4">
                                    We use cookies and similar tracking technologies to:
                                </p>
                                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                    <li>Remember your preferences and settings</li>
                                    <li>Analyze site traffic and usage</li>
                                    <li>Enable certain site functionalities</li>
                                    <li>Provide personalized content</li>
                                </ul>
                                <p className="text-slate-300 mt-4">
                                    You can control cookies through your browser settings. Disabling cookies may limit some features.
                                </p>
                            </section>

                            <section id="security" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    Data Security
                                </h2>
                                <p className="text-slate-300">
                                    We implement industry-standard security measures to protect your data, including encryption,
                                    secure servers, and regular security audits. However, no method of transmission over the
                                    Internet is 100% secure.
                                </p>
                            </section>

                            <section id="rights" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    Your Rights
                                </h2>
                                <p className="text-slate-300 mb-4">You have the right to:</p>
                                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                    <li>Access the personal data we hold about you</li>
                                    <li>Request correction of inaccurate data</li>
                                    <li>Request deletion of your data</li>
                                    <li>Opt out of marketing communications</li>
                                    <li>Export your data in a portable format</li>
                                </ul>
                            </section>

                            <section id="changes" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    Policy Changes
                                </h2>
                                <p className="text-slate-300">
                                    We may update this Privacy Policy from time to time. We will notify you of any changes by
                                    posting the new policy on this page and updating the "Last updated" date.
                                </p>
                            </section>

                            <section id="contact">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    Contact Us
                                </h2>
                                <p className="text-slate-300">
                                    If you have questions about this Privacy Policy, please contact us at{' '}
                                    <a href="mailto:privacy@apicbooks.com" className="text-primary-400 hover:text-primary-300">
                                        privacy@apicbooks.com
                                    </a>{' '}
                                    or visit our{' '}
                                    <Link href="/contact" className="text-primary-400 hover:text-primary-300">
                                        Contact page
                                    </Link>.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
