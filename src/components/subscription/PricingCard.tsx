import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingCardProps {
    tier: {
        name: string;
        price: string;
        description: string;
        features: string[];
        highlight?: boolean;
        cta: string;
    };
    onSelect: () => void;
}

export default function PricingCard({ tier, onSelect }: PricingCardProps) {
    return (
        <div
            className={`
                relative p-8 rounded-3xl border flex flex-col h-full transition-all duration-300
                ${tier.highlight
                    ? 'bg-gradient-to-b from-[#7c5cfc]/10 dark:from-[#9b7aff]/15 to-white dark:to-[#1a1528] border-[#7c5cfc]/30 dark:border-[#9b7aff]/50 shadow-2xl shadow-[#7c5cfc]/10 scale-105 z-10'
                    : 'bg-white/80 dark:bg-[#1a1528]/50 border-[#e0d5c7] dark:border-[#2d2545] hover:border-[#d6cec3] dark:hover:border-[#3d3560]'
                }
            `}
        >
            {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#7c5cfc] to-[#e8914f] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                </div>
            )}

            <div className="mb-8">
                <h3 className={`text-xl font-bold mb-2 ${tier.highlight ? 'text-[#2c1810] dark:text-[#f5f0eb]' : 'text-[#5a4335] dark:text-[#a39484]'}`}>
                    {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-display font-bold text-[#2c1810] dark:text-[#f5f0eb]">{tier.price}</span>
                    {tier.price !== 'Free' && <span className="text-[#a39484] dark:text-[#8b7355]">/month</span>}
                </div>
                <p className="text-[#8b7355] dark:text-[#a39484] text-sm leading-relaxed">
                    {tier.description}
                </p>
            </div>

            <div className="flex-1 mb-8">
                <ul className="space-y-4">
                    {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#5a4335] dark:text-[#a39484]">
                            <div className={`mt-0.5 p-0.5 rounded-full ${tier.highlight ? 'bg-[#7c5cfc]/20 text-[#7c5cfc] dark:text-[#9b7aff]' : 'bg-[#f3efe8] dark:bg-[#241e36] text-[#a39484] dark:text-[#8b7355]'}`}>
                                <Check className="w-3.5 h-3.5" />
                            </div>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <button
                onClick={onSelect}
                className={`
                    w-full py-4 rounded-xl font-bold transition-all duration-300
                    ${tier.highlight
                        ? 'btn-gradient text-white shadow-lg shadow-[#7c5cfc]/25'
                        : 'bg-[#f3efe8] dark:bg-[#241e36] hover:bg-[#ebe5dc] dark:hover:bg-[#2d2545] text-[#2c1810] dark:text-[#f5f0eb] border border-[#e0d5c7] dark:border-[#2d2545]'
                    }
                `}
            >
                {tier.cta}
            </button>
        </div>
    );
}
