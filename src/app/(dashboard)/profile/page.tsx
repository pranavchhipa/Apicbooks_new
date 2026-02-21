'use client';

import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import {
    User,
    MapPin,
    Link as LinkIcon,
    Calendar,
    BookOpen,
    BarChart2,
    Edit3,
    Share2,
    Trophy,
    Target,
    Clock,
    Star,
    Flame,
    TrendingUp,
    Award,
    Sparkles,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import MonthlyWrapped from '@/components/profile/MonthlyWrapped';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ReadingActivity from '@/components/profile/ReadingActivity';
import ReadingGoalProgress from '@/components/ReadingGoalProgress';
import StreakBadge from '@/components/StreakBadge';
import { UserProfile, getUserProfile } from '@/lib/api/user';

// Academic Shelf Component
function AcademicShelf({ userId }: { userId: string }) {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchAcademicBooks = async () => {
            const { data } = await supabase
                .from('user_books')
                .select('*')
                .eq('user_id', userId)
                .eq('is_academic', true);
            setBooks(data || []);
            setLoading(false);
        };
        if (userId) fetchAcademicBooks();
    }, [userId]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading research...</div>;

    if (books.length === 0) {
        return (
            <div className="p-12 text-center bg-gradient-to-br from-[#141b3d]/60 to-[#0d1128]/60 border border-card-border rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">My Research Library</h3>
                <p className="text-slate-400 max-w-sm mx-auto mb-6">
                    A dedicated space for your academic collection. Mark books as "Academic" when adding them.
                </p>
                <button className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                    Add Research Paper
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            {books.map(book => (
                <div key={book.id} className="group relative aspect-[2/3] bg-slate-800 rounded-xl overflow-hidden border border-card-border hover:border-indigo-500/50 transition-all hover:scale-105 hover:shadow-lg">
                    {book.cover_url ? (
                        <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-800">
                            <span className="text-xs text-slate-400 line-clamp-3">{book.title}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-2 left-2 right-2">
                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded backdrop-blur-md border border-indigo-500/20">
                            ACADEMIC
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Reviews List Component
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
                .order('updated_at', { ascending: false });
            setReviews(data || []);
            setLoading(false);
        };
        fetchReviews();
    }, [userId]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="p-12 text-center bg-gradient-to-br from-[#141b3d]/60 to-[#0d1128]/60 border border-card-border rounded-2xl">
                <Edit3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Reviews Yet</h3>
                <p className="text-slate-400">Rate or review books in your library to see them here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((item) => (
                <Link
                    key={item.id}
                    href={`/book/${item.book_id}`}
                    className="bg-gradient-to-r from-[#141b3d]/80 to-[#0d1128]/80 border border-card-border p-4 rounded-xl flex gap-4 hover:border-amber-500/30 transition-colors"
                >
                    <div className="relative w-16 h-24 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden">
                        {item.book?.cover_url && (
                            <Image src={item.book.cover_url} alt={item.book.title} fill className="object-cover" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-white">{item.book?.title}</h4>
                        <p className="text-xs text-slate-400 mb-2">{item.book?.authors?.join(', ')}</p>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < (item.rating || 0) ? 'fill-current' : 'text-slate-700'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-slate-500">
                                {new Date(item.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                        {item.review ? (
                            <p className="text-sm text-slate-300 italic">"{item.review}"</p>
                        ) : (
                            <p className="text-xs text-slate-500 italic">No written review.</p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [allBooks, setAllBooks] = useState<any[]>([]);

    const supabase = createClient();
    const [stats, setStats] = useState({ read: 0, reviews: 0, currentlyReading: 0, streak: 0, longestStreak: 0, goal: 12 });

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const userProfile = await getUserProfile(user.id);
                setProfile(userProfile);

                const [readRes, reviewsRes, readingRes, allBooksRes] = await Promise.all([
                    supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
                    supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id).not('rating', 'is', null),
                    supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'reading'),
                    supabase.from('user_library').select('*').eq('user_id', user.id).not('updated_at', 'is', null)
                ]);

                setAllBooks(allBooksRes.data || []);

                setStats({
                    read: readRes.count || 0,
                    reviews: reviewsRes.count || 0,
                    currentlyReading: readingRes.count || 0,
                    streak: userProfile?.current_streak || 0,
                    longestStreak: userProfile?.longest_streak || 0,
                    goal: userProfile?.reading_goal || 12
                });
            }
            setLoading(false);
        };
        getData();
    }, []);

    const handleShareStats = () => {
        toast.info("Generating shareable stats card... (Coming Soon)");
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500/20 to-accent-500/20 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12">
            {/* Profile Header */}
            <div className="mb-8">
                <div className="bg-gradient-to-br from-[#141b3d]/95 to-[#0d1128]/95 backdrop-blur-xl border border-card-border rounded-2xl p-6 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        {/* Avatar */}
                        <div className="relative mx-auto md:mx-0">
                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 p-1 shadow-2xl">
                                <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 relative">
                                    {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                                        <Image
                                            src={profile?.avatar_url || user.user_metadata.avatar_url}
                                            alt="Profile"
                                            className="object-cover"
                                            fill
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500 text-4xl font-bold text-white">
                                            {user?.email?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="absolute -bottom-2 -right-2 p-2 bg-[#141b3d] rounded-lg text-slate-300 hover:text-white border border-card-border shadow-lg hover:border-primary-500/50 transition-all"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                                {profile?.full_name || user?.user_metadata?.full_name || 'Reader'}
                            </h1>
                            <p className="text-slate-400 text-sm mb-3">{user?.email}</p>

                            {/* Quick Info Tags */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary dark:bg-[#0c0a14]/50 border border-card-border text-xs text-slate-400">
                                    <MapPin className="w-3 h-3" />
                                    {profile?.location || "Unknown Location"}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary dark:bg-[#0c0a14]/50 border border-card-border text-xs text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    Joined {joinDate}
                                </span>
                                {/* Social Stats */}
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0a0e27]/80 border border-card-border text-xs text-slate-300 hover:border-primary-500/50 transition-colors cursor-pointer">
                                    <User className="w-3 h-3 text-primary-400" />
                                    0 Followers
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0a0e27]/80 border border-card-border text-xs text-slate-300 hover:border-primary-500/50 transition-colors cursor-pointer">
                                    <User className="w-3 h-3 text-primary-400" />
                                    0 Following
                                </span>
                                {profile?.website && (
                                    <a
                                        href={profile.website}
                                        target="_blank"
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-xs text-primary-400 hover:bg-primary-500/20 transition-colors"
                                    >
                                        <LinkIcon className="w-3 h-3" />
                                        Website
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-center md:justify-end">
                            <button
                                onClick={handleShareStats}
                                className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                            >
                                <Share2 className="w-4 h-4" />
                                Share Stats
                            </button>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-5 py-2.5 bg-secondary dark:bg-[#0c0a14] border border-card-border text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:border-slate-600 transition-all"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit
                            </button>
                        </div>
                    </div>

                    {/* Bio */}
                    {(profile?.bio || user?.user_metadata?.bio) && (
                        <p className="mt-6 text-slate-300 text-sm leading-relaxed max-w-2xl border-t border-card-border pt-6">
                            "{profile?.bio || user?.user_metadata?.bio}"
                        </p>
                    )}
                </div>
            </div>

            {/* Spacer for Profile Card */}
            <div className="h-6" />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 px-4">
                {[
                    { label: 'Books Read', value: stats.read, icon: BookOpen, color: 'blue', gradient: 'from-blue-500/30 to-blue-600/20 border-blue-500/30' },
                    { label: 'Currently Reading', value: stats.currentlyReading, icon: Clock, color: 'green', gradient: 'from-green-500/30 to-green-600/20 border-green-500/30' },
                    { label: 'Reviews', value: stats.reviews, icon: Star, color: 'amber', gradient: 'from-amber-500/30 to-amber-600/20 border-amber-500/30' },
                    { label: 'Reading Streak', value: stats.streak, icon: Flame, color: 'orange', gradient: 'from-orange-500/30 to-orange-600/20 border-orange-500/30' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} backdrop-blur-xl border rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 group shadow-lg`}
                    >
                        <div className={`p-2 rounded-xl bg-${stat.color}-500/20 w-fit mb-3 border border-${stat.color}-500/20`}>
                            <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1 shadow-sm">
                            {stat.value}
                        </div>
                        <div className="text-sm text-slate-200 font-medium opacity-90">{stat.label}</div>

                        {/* Decorative glow */}
                        <div className={`absolute -top-12 -right-12 w-24 h-24 bg-${stat.color}-500/20 rounded-full blur-2xl group-hover:bg-${stat.color}-500/30 transition-colors`} />
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6 px-4">
                {/* Left Column - Monthly Wrapped & Achievements */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Reading Activity Chart - New Location */}
                    <ReadingActivity books={allBooks} userId={user?.id} />

                    {/* Monthly Wrapped */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary-400" />
                                Monthly Wrapped
                            </h2>
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">
                                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <MonthlyWrapped userId={user?.id} userName={profile?.full_name || 'Reader'} />
                    </section>

                    {/* Recent Reviews */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-400" />
                                Recent Reviews
                            </h2>
                        </div>
                        <ReviewsList userId={user?.id} />
                    </section>
                </div>

                {/* Right Column - Stats Charts & Achievements */}
                <div className="space-y-6">
                    {/* Reading Goal Progress */}
                    <ReadingGoalProgress
                        booksRead={stats.read}
                        goalBooks={stats.goal}
                        size="md"
                    />

                    {/* Achievements */}
                    <section className="bg-gradient-to-br from-[#141b3d]/80 to-[#0d1128]/80 backdrop-blur-xl border border-card-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <h3 className="text-lg font-semibold text-white">Achievements</h3>
                            </div>
                            <span className="text-xs text-slate-500">3 unlocked</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { emoji: '📚', label: 'First Book', unlocked: stats.read >= 1 },
                                { emoji: '⭐', label: 'Reviewer', unlocked: stats.reviews >= 1 },
                                { emoji: '🎯', label: 'Goal Setter', unlocked: true },
                                { emoji: '🔥', label: '7-Day Streak', unlocked: false },
                                { emoji: '📖', label: '10 Books', unlocked: stats.read >= 10 },
                                { emoji: '🏆', label: 'Bookworm', unlocked: false },
                            ].map((achievement, i) => (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${achievement.unlocked
                                        ? 'bg-amber-500/10 border-amber-500/30'
                                        : 'bg-[#0a0e27]/50 border-card-border opacity-50'
                                        }`}
                                    title={achievement.label}
                                >
                                    <span className="text-2xl mb-1">{achievement.emoji}</span>
                                    <span className="text-[10px] text-slate-400 text-center px-1">{achievement.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Quick Links */}
                    <section className="bg-gradient-to-br from-[#141b3d]/60 to-[#0d1128]/60 backdrop-blur-xl border border-card-border rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>

                        <div className="space-y-2">
                            <Link
                                href="/my-books"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#0a0e27]/50 transition-colors group"
                            >
                                <span className="text-sm text-slate-300 group-hover:text-white">My Books</span>
                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                            </Link>
                            <Link
                                href="/discover"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#0a0e27]/50 transition-colors group"
                            >
                                <span className="text-sm text-slate-300 group-hover:text-white">Discover Books</span>
                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                            </Link>
                            <Link
                                href="/settings"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#0a0e27]/50 transition-colors group"
                            >
                                <span className="text-sm text-slate-300 group-hover:text-white">Settings</span>
                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>

            {/* Edit Profile Modal */}
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
