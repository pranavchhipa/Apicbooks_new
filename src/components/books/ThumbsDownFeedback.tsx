'use client';

import { useState } from 'react';
import { ThumbsDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DISLIKE_REASONS = [
    'Boring plot',
    'Poor writing style',
    'Too predictable',
    'Not my genre',
    'Too long/slow',
    'Confusing storyline',
    'Unlikeable characters',
    'Other',
];

interface ThumbsDownFeedbackProps {
    selectedReasons: string[];
    onChange: (reasons: string[]) => void;
    compact?: boolean;
}

export default function ThumbsDownFeedback({
    selectedReasons,
    onChange,
    compact = false,
}: ThumbsDownFeedbackProps) {
    const [isExpanded, setIsExpanded] = useState(selectedReasons.length > 0);

    const toggleReason = (reason: string) => {
        if (selectedReasons.includes(reason)) {
            onChange(selectedReasons.filter(r => r !== reason));
        } else {
            onChange([...selectedReasons, reason]);
        }
    };

    const hasReasons = selectedReasons.length > 0;

    return (
        <div className="space-y-3">
            {/* Thumbs-down toggle button */}
            <button
                type="button"
                onClick={() => {
                    if (isExpanded && hasReasons) {
                        // Clear all reasons when collapsing
                        onChange([]);
                    }
                    setIsExpanded(!isExpanded);
                }}
                className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${hasReasons
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10'
                        : isExpanded
                            ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400/80 border border-rose-500/20'
                            : 'bg-slate-200 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700/30 hover:border-rose-500/30 hover:text-rose-500 dark:hover:text-rose-400/70'
                    }
                `}
            >
                <ThumbsDown className={`w-4 h-4 ${hasReasons ? 'fill-rose-400/30' : ''}`} />
                {hasReasons
                    ? `${selectedReasons.length} issue${selectedReasons.length > 1 ? 's' : ''} selected`
                    : "Didn't enjoy it?"
                }
                {hasReasons && (
                    <X className="w-3.5 h-3.5 ml-1 opacity-60 hover:opacity-100" />
                )}
            </button>

            {/* Expandable reason chips */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className={`
                            p-3 rounded-xl border
                            bg-rose-500/5 dark:bg-rose-500/5 bg-rose-50
                            border-rose-500/15 dark:border-rose-500/15 border-rose-200
                        `}>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2.5 font-medium">
                                What didn&apos;t work for you? <span className="text-slate-500 dark:text-slate-600">(helps improve recommendations)</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {DISLIKE_REASONS.map((reason) => {
                                    const isSelected = selectedReasons.includes(reason);
                                    return (
                                        <button
                                            key={reason}
                                            type="button"
                                            onClick={() => toggleReason(reason)}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                                                ${isSelected
                                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                                                    : 'bg-slate-800/30 dark:bg-slate-800/30 bg-white text-slate-400 dark:text-slate-400 text-slate-500 border border-slate-700/20 dark:border-slate-700/20 border-slate-200 hover:border-rose-500/30 hover:text-rose-400'
                                                }
                                            `}
                                        >
                                            {reason}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
