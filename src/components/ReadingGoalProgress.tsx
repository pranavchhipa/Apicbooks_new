'use client';

import { Target, BookOpen, Trophy, TrendingUp } from 'lucide-react';

interface ReadingGoalProgressProps {
    booksRead: number;
    goalBooks: number;
    year?: number;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Circular progress indicator for reading goals
 */
export default function ReadingGoalProgress({
    booksRead = 0,
    goalBooks = 12,
    year = new Date().getFullYear(),
    size = 'md'
}: ReadingGoalProgressProps) {
    const percentage = goalBooks > 0 ? Math.min((booksRead / goalBooks) * 100, 100) : 0;
    const isComplete = booksRead >= goalBooks;
    const remaining = Math.max(goalBooks - booksRead, 0);

    const sizeConfig = {
        sm: { circle: 80, stroke: 6, text: 'text-lg', subtext: 'text-[10px]' },
        md: { circle: 120, stroke: 8, text: 'text-2xl', subtext: 'text-xs' },
        lg: { circle: 160, stroke: 10, text: 'text-4xl', subtext: 'text-sm' }
    };

    const config = sizeConfig[size];
    const radius = (config.circle - config.stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-gradient-to-br from-[#141b3d]/80 to-[#0d1128]/80 backdrop-blur-xl border border-card-border rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{year} Reading Goal</h3>
                    <p className="text-xs text-muted-foreground">
                        {isComplete ? '🎉 Goal achieved!' : `${remaining} books to go`}
                    </p>
                </div>
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center mb-6">
                <div className="relative" style={{ width: config.circle, height: config.circle }}>
                    {/* Background circle */}
                    <svg className="transform -rotate-90" width={config.circle} height={config.circle}>
                        <circle
                            cx={config.circle / 2}
                            cy={config.circle / 2}
                            r={radius}
                            fill="transparent"
                            stroke="#1e2749"
                            strokeWidth={config.stroke}
                        />
                        {/* Progress circle */}
                        <circle
                            cx={config.circle / 2}
                            cy={config.circle / 2}
                            r={radius}
                            fill="transparent"
                            stroke={isComplete ? 'url(#goalCompleteGradient)' : 'url(#goalProgressGradient)'}
                            strokeWidth={config.stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="goalProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                            <linearGradient id="goalCompleteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {isComplete ? (
                            <Trophy className={`text-emerald-400 ${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10'}`} />
                        ) : (
                            <>
                                <span className={`font-bold text-foreground ${config.text}`}>
                                    {Math.round(percentage)}%
                                </span>
                                <span className={`text-muted-foreground ${config.subtext}`}>
                                    {booksRead}/{goalBooks}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#0a0e27]/50 rounded-xl p-3">
                    <BookOpen className="w-4 h-4 mx-auto text-primary-400 mb-1" />
                    <p className="text-lg font-bold text-foreground">{booksRead}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Read</p>
                </div>
                <div className="bg-[#0a0e27]/50 rounded-xl p-3">
                    <Target className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                    <p className="text-lg font-bold text-foreground">{goalBooks}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Goal</p>
                </div>
                <div className="bg-[#0a0e27]/50 rounded-xl p-3">
                    <TrendingUp className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                    <p className="text-lg font-bold text-foreground">{remaining}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">To Go</p>
                </div>
            </div>
        </div>
    );
}

// Compact version for dashboard
export function ReadingGoalCompact({ booksRead, goalBooks }: { booksRead: number; goalBooks: number }) {
    const percentage = goalBooks > 0 ? Math.min((booksRead / goalBooks) * 100, 100) : 0;

    return (
        <div className="flex items-center gap-3 bg-elevated/50 rounded-xl p-3">
            <div className="relative w-10 h-10">
                <svg className="transform -rotate-90" width={40} height={40}>
                    <circle
                        cx={20}
                        cy={20}
                        r={16}
                        fill="transparent"
                        stroke="#374151"
                        strokeWidth={4}
                    />
                    <circle
                        cx={20}
                        cy={20}
                        r={16}
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeDasharray={100}
                        strokeDashoffset={100 - percentage}
                        className="transition-all duration-500"
                    />
                </svg>
                <Target className="absolute inset-0 m-auto w-4 h-4 text-primary-400" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">{booksRead} of {goalBooks} books</p>
                <p className="text-xs text-muted-foreground">{Math.round(percentage)}% complete</p>
            </div>
        </div>
    );
}
