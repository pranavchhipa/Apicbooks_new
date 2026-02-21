'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Clock, BookOpen, BarChart3 } from 'lucide-react';
import { getWeeklyReadingStats } from '@/lib/api/library';
import { createClient } from '@/lib/supabase/client';

export default function ReadingAnalytics() {
    const [weeklyStats, setWeeklyStats] = useState<{
        totalMinutes: number;
        totalPages: number;
        dailyStats: { date: string; minutes: number; pages: number }[];
        moodCounts?: Record<string, number>;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [booksInProgress, setBooksInProgress] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const [stats, booksRes] = await Promise.all([
                    getWeeklyReadingStats(user.id),
                    supabase
                        .from('user_library')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)
                        .eq('status', 'reading')
                ]);

                setWeeklyStats(stats);
                setBooksInProgress(booksRes.count || 0);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatMinutes = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    const getDayLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);

        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yday';
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    if (loading) {
        return (
            <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-5 h-5 bg-card-border rounded" />
                    <div className="h-6 w-40 bg-card-border rounded" />
                </div>

                {/* Stats Row Skeleton */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-card-border rounded-xl" />
                            <div className="h-6 w-16 bg-card-border rounded" />
                            <div className="h-3 w-12 bg-card-border rounded" />
                        </div>
                    ))}
                </div>

                {/* Chart Skeleton */}
                <div className="flex items-end justify-between gap-2 h-24 px-1">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-card-border rounded-t-md" style={{ height: `${Math.random() * 60 + 20}%` }} />
                            <div className="h-2 w-full bg-card-border rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Calculate max for chart scaling
    const maxMinutes = weeklyStats
        ? Math.max(...weeklyStats.dailyStats.map(d => d.minutes), 1)
        : 1;

    return (
        <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6 hover:border-primary-500/30 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-primary-400" />
                <h3 className="font-semibold text-foreground">This Week's Reading</h3>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-primary-500/10 border border-primary-500/20">
                        <Clock className="w-5 h-5 text-primary-400" />
                    </div>
                    <p className="text-xl font-bold text-foreground">
                        {formatMinutes(weeklyStats?.totalMinutes || 0)}
                    </p>
                    <p className="text-xs text-slate-500">Total Time</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-xl font-bold text-foreground">
                        {weeklyStats?.totalPages || 0}
                    </p>
                    <p className="text-xs text-slate-500">Pages Read</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <BookOpen className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-xl font-bold text-foreground">
                        {booksInProgress}
                    </p>
                    <p className="text-xs text-slate-500">In Progress</p>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-24 px-1">
                {weeklyStats?.dailyStats.map((day, index) => {
                    const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
                    const isToday = index === weeklyStats.dailyStats.length - 1;

                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className="w-full relative group cursor-pointer"
                                style={{ height: '80px' }}
                            >
                                {/* Bar */}
                                <div
                                    className={`
                                        absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 rounded-t-md transition-all duration-300
                                        ${isToday
                                            ? 'bg-gradient-to-t from-primary-500 to-accent-500'
                                            : 'bg-gradient-to-t from-[#1e2749] to-[#2a3a5c]'}
                                        ${day.minutes > 0 ? 'group-hover:opacity-80' : ''}
                                    `}
                                    style={{
                                        height: `${Math.max(height, day.minutes > 0 ? 8 : 2)}%`,
                                        minHeight: day.minutes > 0 ? '8px' : '2px'
                                    }}
                                />

                                {/* Tooltip */}
                                {day.minutes > 0 && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-secondary dark:bg-[#0c0a14] border border-card-border rounded-lg text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        {formatMinutes(day.minutes)} • {day.pages} pages
                                    </div>
                                )}
                            </div>
                            <span className={`text-[10px] ${isToday ? 'text-primary-400 font-medium' : 'text-slate-500'}`}>
                                {getDayLabel(day.date)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Session Vibes (Moods) */}
            {weeklyStats?.moodCounts && Object.keys(weeklyStats.moodCounts).length > 0 && (
                <div className="mt-6 pt-4 border-t border-card-border">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Session Vibes</h4>
                    <div className="space-y-3">
                        {Object.entries(weeklyStats!.moodCounts!)
                            .sort(([, a], [, b]) => b - a) // Sort by most frequent
                            .slice(0, 3) // Top 3
                            .map(([mood, count]) => {
                                // Calculate simple percentage based on total sessions tracked with mood
                                const totalWithMood = Object.values(weeklyStats!.moodCounts!).reduce((a, b) => a + b, 0);
                                const pct = Math.round((count / totalWithMood) * 100);

                                const getMoodIcon = (m: string) => {
                                    switch (m) {
                                        case 'Focused': return '🔥';
                                        case 'Relaxed': return '😊';
                                        case 'Reflective': return '🤔';
                                        case 'Sleepy': return '😴';
                                        default: return '📖';
                                    }
                                };

                                return (
                                    <div key={mood} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="flex items-center gap-1.5 text-foreground">
                                                <span>{getMoodIcon(mood)}</span> {mood}
                                            </span>
                                            <span className="text-muted-foreground">{count} session{count !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-secondary dark:bg-[#0c0a14] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-500/50 rounded-full"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Empty state message */}
            {weeklyStats?.totalMinutes === 0 && (
                <p className="text-center text-sm text-slate-500 mt-4">
                    No reading sessions this week. Start a timer to track your progress!
                </p>
            )}
        </div>
    );
}
