import { FileText } from 'lucide-react';
import Link from 'next/link';

const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'service', title: 'Description of Service' },
    { id: 'account', title: 'User Accounts' },
    { id: 'conduct', title: 'User Conduct' },
    { id: 'intellectual', title: 'Intellectual Property' },
    { id: 'disclaimers', title: 'Disclaimers' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'termination', title: 'Termination' },
    { id: 'governing', title: 'Governing Law' },
    { id: 'contact', title: 'Contact' },
];

export default function TermsPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary-500/20 mb-6">
                        <FileText className="w-8 h-8 text-secondary-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Terms of Service
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
                                Welcome to BookScanner. By accessing or using our website and services, you agree to be bound
                                by these Terms of Service. Please read them carefully.
                            </p>

                            <section id="acceptance" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    1. Acceptance of Terms
                                </h2>
                                <p className="text-slate-300">
                                    By accessing or using BookScanner ("Service"), you agree to be bound by these Terms of Service
                                    and all applicable laws and regulations. If you do not agree with any of these terms, you are
                                    prohibited from using or accessing this site.
                                </p>
                            </section>

                            <section id="service" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    2. Description of Service
                                </h2>
                                <p className="text-slate-300 mb-4">
                                    BookScanner provides a book price comparison service that:
                                </p>
                                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                    <li>Aggregates book prices from multiple online retailers</li>
                                    <li>Offers AI-powered book recommendations based on mood</li>
                                    <li>Provides wishlist and price alert features for registered users</li>
                                    <li>Displays affiliate links to third-party retailers</li>
                                </ul>
                                <p className="text-slate-300 mt-4">
                                    We do not sell books directly. All purchases are made through third-party retailers.
                                </p>
                            </section>

                            <section id="account" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    3. User Accounts
                                </h2>
                                <p className="text-slate-300 mb-4">
                                    When you create an account with us, you must provide accurate and complete information.
                                    You are responsible for:
                                </p>
                                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                    <li>Safeguarding your password</li>
                                    <li>All activities that occur under your account</li>
                                    <li>Notifying us immediately of any unauthorized use</li>
                                </ul>
                            </section>

                            <section id="conduct" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    4. User Conduct
                                </h2>
                                <p className="text-slate-300 mb-4">You agree not to:</p>
                                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                    <li>Use the service for any unlawful purpose</li>
                                    <li>Attempt to gain unauthorized access to our systems</li>
                                    <li>Interfere with or disrupt the service</li>
                                    <li>Scrape or collect data without permission</li>
                                    <li>Transmit viruses or harmful code</li>
                                    <li>Impersonate any person or entity</li>
                                </ul>
                            </section>

                            <section id="intellectual" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    5. Intellectual Property
                                </h2>
                                <p className="text-slate-300">
                                    The Service and its original content, features, and functionality are owned by BookScanner
                                    and are protected by international copyright, trademark, and other intellectual property laws.
                                    Book cover images and retailer logos are property of their respective owners.
                                </p>
                            </section>

                            <section id="disclaimers" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    6. Disclaimers
                                </h2>
                                <p className="text-slate-300 mb-4">
                                    The Service is provided "as is" without warranties of any kind. We do not guarantee:
                                </p>
                                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                    <li>Accuracy of prices displayed (prices change frequently)</li>
                                    <li>Availability of books at listed retailers</li>
                                    <li>Uninterrupted or error-free service</li>
                                    <li>Results from AI recommendations</li>
                                </ul>
                            </section>

                            <section id="liability" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    7. Limitation of Liability
                                </h2>
                                <p className="text-slate-300">
                                    BookScanner shall not be liable for any indirect, incidental, special, consequential, or
                                    punitive damages resulting from your use of the Service. Our total liability shall not
                                    exceed the amount paid by you, if any, for accessing the Service.
                                </p>
                            </section>

                            <section id="termination" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    8. Termination
                                </h2>
                                <p className="text-slate-300">
                                    We may terminate or suspend your account and access to the Service immediately, without
                                    prior notice, for any reason, including breach of these Terms. Upon termination, your
                                    right to use the Service will immediately cease.
                                </p>
                            </section>

                            <section id="governing" className="mb-10">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    9. Governing Law
                                </h2>
                                <p className="text-slate-300">
                                    These Terms shall be governed by the laws of the State of California, United States,
                                    without regard to its conflict of law provisions. Any disputes shall be resolved in
                                    the courts located in San Francisco, California.
                                </p>
                            </section>

                            <section id="contact">
                                <h2 className="text-2xl font-display font-bold text-white mb-4">
                                    10. Contact
                                </h2>
                                <p className="text-slate-300">
                                    If you have questions about these Terms, please contact us at{' '}
                                    <a href="mailto:legal@bookscanner.com" className="text-primary-400 hover:text-primary-300">
                                        legal@bookscanner.com
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
