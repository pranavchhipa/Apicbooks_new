'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/landing/FooterCTA';
import PricingCard from '@/components/subscription/PricingCard';
import UpgradeModal from '@/components/subscription/UpgradeModal';

const TIERS = [
    {
        name: 'Reader',
        price: 'Free',
        description: 'Perfect for casual readers who want to track their books and find the best deals.',
        features: [
            'Basic Book Search',
            'Price Comparison (Best New & Used)',
            '3 AI Mood Searches / Day',
            'Curated Community Lists'
        ],
        cta: 'Current Plan',
        highlight: false
    },
    {
        name: 'Pro Bibliophile',
        price: '$4.99',
        description: 'For power users who want unlimited AI access and historical price tracking.',
        features: [
            'Everything in Reader',
            'Unlimited AI Mood Searches',
            'Price History Charts & Alerts',
            'Multi-Region Price Comparison',
            'Ad-free Experience',
            'Early Access to New Features'
        ],
        cta: 'Upgrade to Pro',
        highlight: true
    }
];

export default function PricingPage() {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState('Pro Plan');

    const handleSelectTier = (tierName: string) => {
        if (tierName === 'Pro Bibliophile') {
            setSelectedFeature('Pro Plan');
            setIsUpgradeModalOpen(true);
        }
    };

    return (
        <main className="min-h-screen bg-[#faf8f5] dark:bg-[#0c0a14] text-[#2c1810] dark:text-[#f5f0eb] selection:bg-primary-500/30 selection:text-white">
            <Navbar user={null} />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-[#2c1810] dark:text-[#f5f0eb] mb-6">
                        Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c5cfc] to-[#e8914f]">Reading Life</span>
                    </h1>
                    <p className="text-xl text-[#8b7355] dark:text-[#a39484] max-w-2xl mx-auto">
                        Choose the plan that fits your reading habits. Upgrade anytime to unlock the full power of ApicBooks.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {TIERS.map((tier) => (
                        <PricingCard
                            key={tier.name}
                            tier={tier}
                            onSelect={() => handleSelectTier(tier.name)}
                        />
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-[#a39484] dark:text-[#8b7355] mb-4">Trusted by over 10,000 book lovers</p>
                    <div className="flex justify-center gap-8 opacity-50 grayscale">
                        {/* Placeholders for logos if needed */}
                    </div>
                </div>
            </div>

            <Footer />

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                featureName={selectedFeature}
            />
        </main>
    );
}
