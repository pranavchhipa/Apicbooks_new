'use client';

import { Flame, Trophy, Zap } from 'lucide-react';

interface StreakBadgeProps {
    currentStreak: number;
    longestStreak?: number;
    size?: 'sm' | 'md' | 'lg';
    showBestStreak?: boolean;
}

/**
 * Reading streak badge component
 * Shows current reading streak with fire animation
 */
export default function StreakBadge({
    currentStreak = 0,
    longestStreak = 0,
    size = 'md',
    showBestStreak = false
}: StreakBadgeProps) {
    const sizeClasses = {
        sm: {
            container: 'px-3 py-1.5',
            icon: 'w-4 h-4',
            text: 'text-sm',
            subtext: 'text-[10px]'
        },
        md: {
            container: 'px-4 py-2',
            icon: 'w-5 h-5',
            text: 'text-base',
            subtext: 'text-xs'
        },
        lg: {
            container: 'px-6 py-3',
            icon: 'w-7 h-7',
            text: 'text-xl',
            subtext: 'text-sm'
        }
    };

    const s = sizeClasses[size];
    const isActive = currentStreak > 0;
    const isMilestone = currentStreak >= 7 || currentStreak >= 30 || currentStreak >= 100;

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Main Streak Badge */}
            <div
                className={`
                    relative flex items-center gap-2 rounded-xl font-bold transition-all
                    ${s.container}
                    ${isActive
                        ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-400'
                        : 'bg-slate-800/50 border border-slate-700 text-slate-500'
                    }
                `}
            >
                {/* Fire Icon with Animation */}
                <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
                    <Flame
                        className={`
                            ${s.icon}
                            ${isActive ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'text-slate-600'}
                        `}
                    />
                    {isActive && (
                        <div className="absolute inset-0 animate-ping">
                            <Flame className={`${s.icon} text-orange-400 opacity-30`} />
                        </div>
                    )}
                </div>

                {/* Streak Count */}
                <span className={s.text}>
                    {currentStreak}
                </span>

                {/* Day label */}
                <span className={`${s.subtext} text-muted-foreground font-normal`}>
                    {currentStreak === 1 ? 'day' : 'days'}
                </span>

                {/* Milestone indicator */}
                {isMilestone && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-0.5">
                        <Zap className="w-3 h-3 text-foreground" />
                    </div>
                )}
            </div>

            {/* Best Streak (optional) */}
            {showBestStreak && longestStreak > 0 && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    <span>Best: {longestStreak} days</span>
                </div>
            )}
        </div>
    );
}

// Inline version for dashboard cards
export function StreakBadgeInline({ streak }: { streak: number }) {
    if (streak === 0) return null;

    return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
            <Flame className="w-3 h-3" />
            {streak}
        </div>
    );
}
