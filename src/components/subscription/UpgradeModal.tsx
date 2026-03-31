'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export default function UpgradeModal({ isOpen, onClose, featureName = 'Premium Features' }: UpgradeModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleUpgrade = () => {
        setIsProcessing(true);

        // Mock payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);

            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#ec4899', '#10b981']
            });

            // "Save" the subscription state
            localStorage.setItem('apicbooks_subscription', 'pro');

            // Dispatch event for other components to update
            window.dispatchEvent(new Event('subscription-update'));

            // Close after showing success
            setTimeout(() => {
                onClose();
                setIsSuccess(false); // Reset for next time
            }, 2500);
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Close button */}
                        {!isSuccess && !isProcessing && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        {isSuccess ? (
                            <div className="p-12 flex flex-col items-center text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring" }}
                                    className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6"
                                >
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-2">Welcome to Pro!</h3>
                                <p className="text-slate-400">Your account has been successfully upgraded.</p>
                            </div>
                        ) : (
                            <>
                                {/* Header Image/Gradient */}
                                <div className="h-32 bg-gradient-to-br from-primary-600/20 via-accent-600/20 to-primary-900/20 relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles className="w-16 h-16 text-white/10" />
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            Unlock {featureName}
                                        </h3>
                                        <p className="text-slate-400 text-sm">
                                            Upgrade to ApicBooks Pro to get unlimited access and exclusive power features.
                                        </p>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                            <div className="p-2 bg-primary-500/20 rounded-lg">
                                                <Sparkles className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-white">Unlimited Mood Searches</p>
                                                <p className="text-xs text-slate-400">Ask Anika as much as you want</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                            <div className="p-2 bg-accent-500/20 rounded-lg">
                                                <ShieldCheck className="w-5 h-5 text-accent-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-white">Price History & Alerts</p>
                                                <p className="text-xs text-slate-400">Track price trends over time</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpgrade}
                                        disabled={isProcessing}
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold text-lg shadow-lg shadow-primary-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Upgrade for $4.99/mo'
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-slate-500 mt-4">
                                        Secure payment powered by Stripe (Mock)
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
