import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Trophy, Target, Flame, ChevronRight, FileText, Heart } from 'lucide-react';
import { calculateLevel, calculateUsageXP, getAchievements, Achievement, Level, LEVELS } from '@/lib/gamification';
import AchievementsModal from './AchievementsModal';
import { toast } from 'sonner';

export default function StatsWidget() {
    const [stats, setStats] = useState({
        readCount: 0,
        readThisMonth: 0,
        streak: 0,
        achievementsCount: 0,
        xp: 0,
        level: 'Beginner' as Level
    });

    // Data needed for modal
    const [achievementsList, setAchievementsList] = useState<Achievement[]>([]);
    const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchStats = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Parallel Data Fetching
            const [booksRead, booksMonth, wishlist, reviews, profile] = await Promise.all([
                // 1. Total Read
                supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),

                // 2. Read This Month
                supabase.from('user_library').select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('status', 'completed')
                    .gte('updated_at', new Date(new Date().setDate(1)).toISOString()),

                // 3. Wishlist (for XP)
                supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'wishlist'),

                // 4. Reviews (for XP)
                supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id).not('review', 'is', null),

                // 5. Profile (for Avatar/Bio XP + Streak)
                supabase.from('profiles').select('*').eq('id', user.id).single()
            ]);

            const readCount = booksRead.count || 0;
            const monthRead = booksMonth.count || 0;
            const wishlistCount = wishlist.count || 0;
            const reviewCount = reviews.count || 0;
            const hasAvatar = !!profile.data?.avatar_url;
            const hasBio = !!profile.data?.bio;
            const currentStreak = profile.data?.current_streak || 0;

            // Gamification Calc
            const xp = calculateUsageXP({ readCount, wishlistCount, reviewCount, hasAvatar, hasBio });
            const level = calculateLevel(xp);
            const levelInfo = LEVELS[level]; // Get color info

            const achievements = getAchievements({
                readCount,
                hasAvatar,
                hasBio,
                wishlistCount,
                readThisMonth: monthRead
            });
            const unlockedCount = achievements.filter(a => a.isUnlocked).length;

            setStats({
                readCount,
                readThisMonth: monthRead,
                streak: currentStreak,
                achievementsCount: unlockedCount,
                xp,
                level
            });
            setAchievementsList(achievements);
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-36 rounded-2xl bg-[#141b3d]/60 border border-[#1e2749] animate-pulse" />
                ))}
            </div>
        );
    }

    const goalProgress = stats.readCount > 0 ? Math.min(Math.round((stats.readCount / 24) * 100), 100) : 0;
    const currentLevelInfo = LEVELS[stats.level];

    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Books Read Card */}
                <div className="group relative bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6 hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-transparent rounded-bl-full" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
                                <BookOpen className="w-6 h-6 text-primary-400" />
                            </div>
                            <span className="text-xs font-medium text-success-400 px-3 py-1 bg-success-500/10 rounded-full border border-success-500/20">
                                +{stats.readThisMonth} this month
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-1">Books Read</p>
                        <p className="text-4xl font-bold text-white max-lg:text-3xl">{stats.readCount}</p>
                    </div>
                </div>

                {/* Level / XP Card (Replaces Yearly Goal) */}
                <div className="group relative bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6 hover:border-accent-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-500/20 to-transparent rounded-bl-full" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-accent-500/10 rounded-xl border border-accent-500/20">
                                <Target className="w-6 h-6 text-accent-400" />
                            </div>
                            {/* Dynamic Level Badge Color */}
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border bg-opacity-10 ${currentLevelInfo.color.replace('text-', 'bg-').replace('400', '500')} ${currentLevelInfo.color.replace('text-', 'border-').replace('400', '500')} ${currentLevelInfo.color}`}>
                                Lvl {stats.level}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-1">Total Experience</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-bold text-white max-lg:text-3xl">{stats.xp}</p>
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">XP</span>
                        </div>
                    </div>
                </div>

                {/* Achievements Card - Clickable */}
                <div
                    onClick={() => setIsAchievementModalOpen(true)}
                    className="group cursor-pointer relative bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <Trophy className="w-6 h-6 text-amber-400" />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-amber-400 transition-colors">
                                View details <ChevronRight className="w-3 h-3" />
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-1">Achievements</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-bold text-white max-lg:text-3xl">{stats.achievementsCount}</p>
                            <span className="text-sm text-slate-500">of {achievementsList.length}</span>
                        </div>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="group relative bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6 hover:border-rose-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/20 to-transparent rounded-bl-full" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 ${stats.streak > 0 ? 'animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]' : ''}`}>
                                <Flame className={`w-6 h-6 text-rose-400 ${stats.streak > 0 ? 'fill-rose-400' : ''}`} />
                            </div>
                            <span className="text-xs font-medium text-rose-400 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                                {stats.streak > 0 ? 'Active' : 'Start now'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-1">Reading Streak</p>
                        <p className="text-4xl font-bold text-white max-lg:text-3xl">{stats.streak}</p>
                    </div>
                </div>
            </div>

            <AchievementsModal
                isOpen={isAchievementModalOpen}
                onClose={() => setIsAchievementModalOpen(false)}
                achievements={achievementsList}
                xp={stats.xp}
                level={stats.level}
            />
        </>
    );
}
