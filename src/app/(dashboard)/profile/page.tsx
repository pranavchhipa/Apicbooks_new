'use client';

import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useEffect, useState, useMemo } from 'react';
import {
    User, MapPin, Calendar, BookOpen, Edit3, Share2, Trophy, Target,
    Clock, Star, Flame, TrendingUp, Sparkles, ChevronRight, Users,
    FileText, Tag, Award, BarChart3
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ReadingGoalProgress from '@/components/ReadingGoalProgress';
import StreakBadge from '@/components/StreakBadge';
import { UserProfile, getUserProfile } from '@/lib/api/user';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Reviews List Component ───────────────────────────────────────────────────
function ReviewsList({ userId }: { userId: string }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchReviews = async () => {
            const { data } = await supabase
                .from('user_library')
                .select(`*, book:books (title, cover_url, authors)`)
                .eq('user_id', userId)
                .not('rating', 'is', null)
                .order('updated_at', { ascending: false })
                .limit(5);
            setReviews(data || []);
            setLoading(false);
        };
        fetchReviews();
    }, [userId]);

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex items-center gap-4 p-4 animate-pulse">
                        <div className="w-12 h-16 bg-white/[0.06] rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-white/[0.06] rounded" />
                            <div className="h-3 w-1/4 bg-white/[0.03] rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl text-center py-10">
                <div className="bg-white/[0.06] p-4 rounded-full w-fit mx-auto mb-4">
                    <Edit3 className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-1">No Reviews Yet</h3>
                <p className="text-white/40 text-sm">Rate or review books in your library to see them here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {reviews.map((item) => (
                <Link
                    key={item.id}
                    href={`/book/${item.book_id}`}
                    className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex gap-4 p-4 hover:border-white/[0.12] transition-all duration-200 group"
                >
                    <div className="relative w-12 h-16 shrink-0 bg-white/[0.06] rounded-lg overflow-hidden shadow-book">
                        {item.book?.cover_url && (
                            <Image src={item.book.cover_url} alt={item.book.title} fill className="object-cover" sizes="48px" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate group-hover:text-amber-400 transition-colors">
                            {item.book?.title}
                        </h4>
                        <p className="text-xs text-white/40 mb-1.5 truncate">{item.book?.authors?.join(', ')}</p>
                        <div className="flex items-center gap-2">
                            <div className="flex star-rating">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < (item.rating || 0) ? 'fill-current text-amber-400' : 'text-white/[0.06]'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-white/30">
                                {new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        {item.review && (
                            <p className="text-sm text-white/60 mt-2 font-serif italic line-clamp-2">
                                &ldquo;{item.review}&rdquo;
                            </p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}

// ─── Reading Activity Chart Component ─────────────────────────────────────────
function ReadingActivityChart({ allBooks }: { allBooks: any[] }) {
    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();

        return months.map((month, index) => {
            const count = allBooks.filter(b => {
                const dateStr = b.finished_at || (b.status === 'completed' ? b.updated_at : null);
                if (!dateStr) return false;
                const d = new Date(dateStr);
                return d.getMonth() === index && d.getFullYear() === currentYear;
            }).length;
            return { month, books: count };
        });
    }, [allBooks]);

    const totalThisYear = chartData.reduce((sum, d) => sum + d.books, 0);

    return (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-display font-bold text-white">Reading Activity</h3>
                </div>
                <span className="text-sm font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                    {totalThisYear} books in {new Date().getFullYear()}
                </span>
            </div>

            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id="profileChartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#F5A623" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="month"
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#141419',
                                borderColor: 'rgba(255,255,255,0.06)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                fontSize: '13px',
                                color: '#FFFFFF',
                            }}
                            itemStyle={{ color: '#F5A623' }}
                            formatter={(value: any) => [`${value} books`, 'Read']}
                            cursor={{ stroke: '#F5A623', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="books"
                            stroke="#F5A623"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#profileChartGradient)"
                            dot={{ r: 3, fill: '#F5A623', strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: '#8B5CF6', stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Clubs Section ────────────────────────────────────────────────────────────
function ClubsSection() {
    return (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-display font-bold text-white">Clubs Joined</h3>
                </div>
            </div>
            <div className="text-center py-8">
                <div className="bg-white/[0.06] p-4 rounded-full w-fit mx-auto mb-3">
                    <Users className="w-7 h-7 text-white/20" />
                </div>
                <p className="text-white/40 text-sm mb-3">You have not joined any clubs yet.</p>
                <Link href="/discover" className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                    Explore Clubs
                </Link>
            </div>
        </div>
    );
}

// ─── Folios Section ───────────────────────────────────────────────────────────
function FoliosSection() {
    return (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-display font-bold text-white">Folios Created</h3>
                </div>
            </div>
            <div className="text-center py-8">
                <div className="bg-white/[0.06] p-4 rounded-full w-fit mx-auto mb-3">
                    <FileText className="w-7 h-7 text-white/20" />
                </div>
                <p className="text-white/40 text-sm mb-3">Create your first folio -- a curated collection of books.</p>
                <button className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                    Create a Folio
                </button>
            </div>
        </div>
    );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [allBooks, setAllBooks] = useState<any[]>([]);
    const [stats, setStats] = useState({
        read: 0,
        readThisYear: 0,
        reviews: 0,
        currentlyReading: 0,
        streak: 0,
        longestStreak: 0,
        goal: 12,
        totalPages: 0,
    });

    const supabase = createClient();

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const userProfile = await getUserProfile(user.id);
                setProfile(userProfile);

                const year = new Date().getFullYear();

                const [readRes, readThisYearRes, reviewsRes, readingRes, allBooksRes] = await Promise.all([
                    supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
                    supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed').gte('updated_at', `${year}-01-01`),
                    supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id).not('rating', 'is', null),
                    supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'reading'),
                    supabase.from('user_library').select('*, book:books (page_count)').eq('user_id', user.id),
                ]);

                const allItems = allBooksRes.data || [];
                setAllBooks(allItems);

                const totalPages = allItems.reduce((sum: number, item: any) => {
                    if (item.status === 'completed' && item.book?.page_count) return sum + item.book.page_count;
                    if (item.status === 'reading' && item.current_page) return sum + item.current_page;
                    return sum;
                }, 0);

                setStats({
                    read: readRes.count || 0,
                    readThisYear: readThisYearRes.count || 0,
                    reviews: reviewsRes.count || 0,
                    currentlyReading: readingRes.count || 0,
                    streak: userProfile?.current_streak || 0,
                    longestStreak: userProfile?.longest_streak || 0,
                    goal: userProfile?.reading_goal || 12,
                    totalPages,
                });
            }
            setLoading(false);
        };
        getData();
    }, []);

    const handleShareStats = () => {
        toast.info('Generating shareable stats card... (Coming Soon)');
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-white/[0.03] animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-white/[0.06] border-t-amber-500 rounded-full animate-spin" />
                        </div>
                    </div>
                    <p className="text-white/40 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    const joinDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown';

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12 px-4 sm:px-6">
            {/* ── Profile Header ────────────────────────────────────────────── */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative mx-auto md:mx-0 shrink-0">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 p-1">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-surface relative">
                                {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                                    <Image
                                        src={profile?.avatar_url || user.user_metadata.avatar_url}
                                        alt="Profile"
                                        className="object-cover"
                                        fill
                                        sizes="128px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 text-4xl font-display font-bold text-black">
                                        {user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute -bottom-2 -right-2 p-2 bg-surface rounded-xl text-white/40 hover:text-amber-400 border border-white/[0.06] hover:border-amber-500/20 transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">
                            {profile?.full_name || user?.user_metadata?.full_name || 'Reader'}
                        </h1>
                        <p className="text-white/40 text-sm mb-4">{user?.email}</p>

                        {/* Bio */}
                        {(profile?.bio || user?.user_metadata?.bio) && (
                            <p className="text-white/60 text-sm leading-relaxed font-serif italic mb-4 max-w-xl">
                                &ldquo;{profile?.bio || user?.user_metadata?.bio}&rdquo;
                            </p>
                        )}

                        {/* Info Tags */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 font-medium">
                                <MapPin className="w-3 h-3" />
                                {profile?.location || 'Location not set'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 font-medium">
                                <Calendar className="w-3 h-3" />
                                Joined {joinDate}
                            </span>
                            {profile?.favorite_genres && profile.favorite_genres.length > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-medium">
                                    <Tag className="w-3 h-3" />
                                    {profile.favorite_genres.length} genres
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center md:justify-end shrink-0">
                        <button
                            onClick={handleShareStats}
                            className="text-sm flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            Share Stats
                        </button>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-sm flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-white hover:border-white/[0.12] transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Reading Stats Grid ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Books This Year', value: stats.readThisYear, icon: BookOpen, bgClass: 'bg-amber-500/10', iconClass: 'text-amber-400' },
                    { label: 'Reading Goal', value: `${stats.readThisYear}/${stats.goal}`, icon: Target, bgClass: 'bg-violet-500/10', iconClass: 'text-violet-400' },
                    { label: 'Reading Streak', value: `${stats.streak} days`, icon: Flame, bgClass: 'bg-amber-500/10', iconClass: 'text-amber-400' },
                    { label: 'Total Pages', value: stats.totalPages.toLocaleString(), icon: FileText, bgClass: 'bg-emerald-500/10', iconClass: 'text-emerald-400' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-200 group"
                    >
                        <div className={`p-2 rounded-xl ${stat.bgClass} w-fit mb-3`}>
                            <stat.icon className={`w-5 h-5 ${stat.iconClass}`} />
                        </div>
                        <p className="text-2xl font-display font-bold text-white mb-0.5">
                            {stat.value}
                        </p>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Favorite Genres ────────────────────────────────────────────── */}
            {profile?.favorite_genres && profile.favorite_genres.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-white/30" />
                        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Favorite Genres</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {profile.favorite_genres.map((genre) => (
                            <span
                                key={genre}
                                className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white hover:border-amber-500/20 hover:text-amber-400 transition-colors"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Main Content Grid ─────────────────────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Reading Activity Chart */}
                    <ReadingActivityChart allBooks={allBooks} />

                    {/* Recent Reviews */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-400" />
                                Recent Reviews
                            </h2>
                            <Link href="/my-books" className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <ReviewsList userId={user?.id} />
                    </section>

                    {/* Clubs */}
                    <ClubsSection />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Reading Goal Progress */}
                    <ReadingGoalProgress
                        booksRead={stats.readThisYear}
                        goalBooks={stats.goal}
                        size="md"
                    />

                    {/* Streak Badge */}
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">
                                Reading Streak
                            </h3>
                        </div>
                        <div className="flex justify-center mb-4">
                            <StreakBadge
                                currentStreak={stats.streak}
                                longestStreak={stats.longestStreak}
                                size="lg"
                                showBestStreak={true}
                            />
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <h3 className="font-display font-bold text-white">Achievements</h3>
                            </div>
                            <span className="text-xs text-white/30 font-medium">
                                {[
                                    stats.read >= 1,
                                    stats.reviews >= 1,
                                    true,
                                    stats.streak >= 7,
                                    stats.read >= 10,
                                    stats.read >= 50,
                                ].filter(Boolean).length} unlocked
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'First Book', unlocked: stats.read >= 1, icon: BookOpen },
                                { label: 'Reviewer', unlocked: stats.reviews >= 1, icon: Star },
                                { label: 'Goal Setter', unlocked: true, icon: Target },
                                { label: '7-Day Streak', unlocked: stats.streak >= 7, icon: Flame },
                                { label: '10 Books', unlocked: stats.read >= 10, icon: Award },
                                { label: 'Bookworm', unlocked: stats.read >= 50, icon: Trophy },
                            ].map((achievement, i) => (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all hover:scale-105
                                        ${achievement.unlocked
                                            ? 'bg-amber-500/5 border-amber-500/20'
                                            : 'bg-white/[0.03] border-white/[0.06] opacity-40'
                                        }`}
                                    title={achievement.label}
                                >
                                    <achievement.icon className={`w-5 h-5 mb-1 ${achievement.unlocked ? 'text-amber-400' : 'text-white/20'}`} />
                                    <span className="text-[10px] text-white/40 text-center px-1 font-medium">{achievement.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Folios */}
                    <FoliosSection />

                    {/* Quick Links */}
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                        <h3 className="font-display font-bold text-white mb-4">Quick Links</h3>
                        <div className="space-y-1">
                            {[
                                { href: '/my-books', label: 'My Books' },
                                { href: '/discover', label: 'Discover Books' },
                                { href: '/settings', label: 'Settings' },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
                                >
                                    <span className="text-sm text-white/60 group-hover:text-amber-400 font-medium">{link.label}</span>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Edit Profile Modal ────────────────────────────────────────── */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                profile={profile}
                onProfileUpdate={(newProfile) => setProfile(newProfile)}
            />
        </div>
    );
}
