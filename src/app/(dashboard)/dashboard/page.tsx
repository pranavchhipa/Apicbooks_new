'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    BookOpen,
    Sparkles,
    TrendingUp,
    Info,
    Plus,
    Users,
    Bookmark,
    Target,
    Clock,
    ChevronRight,
    Star,
    ArrowRight,
    Library,
    Heart,
    Trophy,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import StatsWidget from '@/components/dashboard/StatsWidget';
import CurrentlyReading from '@/components/dashboard/CurrentlyReading';
import BestSellersList from '@/components/dashboard/BestSellersList';
import FeaturesGuideModal from '@/components/dashboard/FeaturesGuideModal';
import ProfileSetupModal from '@/components/dashboard/ProfileSetupModal';
import ReadingAnalytics from '@/components/dashboard/ReadingAnalytics';
import SmartRecommendations from '@/components/dashboard/SmartRecommendations';
import StreakBadge from '@/components/StreakBadge';
import ActivityFeed from '@/components/ActivityFeed';
import { ReadingGoalCompact } from '@/components/ReadingGoalProgress';
import { useStreak } from '@/lib/hooks/useStreak';

// ---------- Helpers ----------

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

// ---------- Currently Reading Card (horizontal scroll item) ----------

interface ReadingBookCard {
    id: string;
    book_id: string;
    title: string;
    author: string;
    cover_url: string | null;
    current_page: number;
    total_pages: number;
}

function ReadingBookCardItem({ book }: { book: ReadingBookCard }) {
    const percentage = book.total_pages > 0
        ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100))
        : 0;

    return (
        <Link
            href={`/book/${book.book_id}`}
            className="flex-shrink-0 w-44 group"
        >
            {/* Book Cover */}
            <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-book group-hover:shadow-book-hover transition-all duration-300 group-hover:-translate-y-1 mb-3">
                {book.cover_url ? (
                    <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-surface to-surface-light flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-white/20" />
                    </div>
                )}
                {/* Progress overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-6">
                    <div className="flex items-center justify-between text-[11px] text-white/80 mb-1">
                        <span>{percentage}%</span>
                        <span>p.{book.current_page}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>
            {/* Title & Author */}
            <h4 className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-amber-400 transition-colors">
                {book.title}
            </h4>
            <p className="text-xs text-white/40 mt-0.5 truncate">{book.author}</p>
        </Link>
    );
}

// ---------- Quick Action Button ----------

function QuickAction({
    icon: Icon,
    label,
    href,
    color,
}: {
    icon: React.ElementType;
    label: string;
    href: string;
    color: 'amber' | 'violet' | 'default';
}) {
    const colorMap = {
        amber: 'bg-amber-500/5 border-amber-500/10 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20',
        violet: 'bg-violet-500/5 border-violet-500/10 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/20',
        default: 'bg-white/[0.03] border-white/[0.06] text-white/60 hover:bg-white/[0.06] hover:border-white/[0.12]',
    };

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 group ${colorMap[color]}`}
        >
            <div className="p-2 rounded-lg bg-white/[0.06]">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{label}</span>
            <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0" />
        </Link>
    );
}

// ---------- Reading Goal Circle ----------

function ReadingGoalCircle({ booksRead, goalBooks }: { booksRead: number; goalBooks: number }) {
    const percentage = goalBooks > 0 ? Math.min((booksRead / goalBooks) * 100, 100) : 0;
    const isComplete = booksRead >= goalBooks;
    const circleSize = 100;
    const strokeWidth = 6;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">
                    {new Date().getFullYear()} Reading Goal
                </h3>
            </div>

            <div className="flex items-center gap-4">
                {/* Circle */}
                <div className="relative flex-shrink-0" style={{ width: circleSize, height: circleSize }}>
                    <svg className="transform -rotate-90" width={circleSize} height={circleSize}>
                        <circle
                            cx={circleSize / 2}
                            cy={circleSize / 2}
                            r={radius}
                            fill="transparent"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth={strokeWidth}
                        />
                        <circle
                            cx={circleSize / 2}
                            cy={circleSize / 2}
                            r={radius}
                            fill="transparent"
                            stroke={isComplete ? '#34D399' : '#F5A623'}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {isComplete ? (
                            <Trophy className="w-6 h-6 text-emerald-400" />
                        ) : (
                            <>
                                <span className="text-lg font-bold text-white">{booksRead}</span>
                                <span className="text-[10px] text-white/40">of {goalBooks}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/60">
                        {isComplete
                            ? 'You reached your goal!'
                            : `${Math.max(goalBooks - booksRead, 0)} books to go`
                        }
                    </p>
                    <div className="mt-2 h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <p className="text-xs text-white/30 mt-1">{Math.round(percentage)}% complete</p>
                </div>
            </div>
        </div>
    );
}

// ---------- Main Dashboard Content ----------

function DashboardContent() {
    useStreak();

    const [userName, setUserName] = useState('Reader');
    const [userId, setUserId] = useState('');
    const [readingBooks, setReadingBooks] = useState<ReadingBookCard[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
    const [userStats, setUserStats] = useState({
        streak: 0,
        longestStreak: 0,
        booksRead: 0,
        goal: 12,
    });
    const [hasFinishedOnboarding, setHasFinishedOnboarding] = useState(true);

    const supabase = createClient();

    // Fetch user data & currently reading books
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Parallel fetches
            const [profileRes, booksRes, countRes] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('full_name, current_streak, longest_streak, reading_goal, favorite_genres')
                    .eq('id', user.id)
                    .single(),
                supabase
                    .from('user_library')
                    .select(`
                        id,
                        book_id,
                        current_page,
                        book:books (title, authors, cover_url, page_count)
                    `)
                    .eq('user_id', user.id)
                    .eq('status', 'reading')
                    .order('updated_at', { ascending: false })
                    .limit(10),
                supabase
                    .from('user_library')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('status', 'completed')
                    .gte('updated_at', `${new Date().getFullYear()}-01-01`),
            ]);

            const profile = profileRes.data;
            const onboarded = !!(profile?.full_name && profile?.favorite_genres && profile.favorite_genres.length > 0);
            setHasFinishedOnboarding(onboarded);

            if (profile?.full_name) {
                setUserName(profile.full_name.split(' ')[0]);
            }

            setUserStats({
                streak: profile?.current_streak || 0,
                longestStreak: profile?.longest_streak || 0,
                booksRead: countRes.count || 0,
                goal: profile?.reading_goal || 12,
            });

            // Format reading books for horizontal scroll
            if (booksRes.data && booksRes.data.length > 0) {
                const formatted = booksRes.data.map((item: any) => ({
                    id: item.id,
                    book_id: item.book_id,
                    title: item.book?.title || 'Untitled',
                    author: item.book?.authors?.[0] || 'Unknown',
                    cover_url: item.book?.cover_url || null,
                    current_page: item.current_page || 0,
                    total_pages: item.book?.page_count || 0,
                }));
                setReadingBooks(formatted);
            }
            setLoadingBooks(false);

            // New user guide check
            const hasSeen = localStorage.getItem('hasSeenGuide');
            if (!hasSeen) {
                setTimeout(() => {
                    setIsGuideOpen(true);
                    localStorage.setItem('hasSeenGuide', 'true');
                }, 1000);
            } else if (!onboarded) {
                setIsProfileSetupOpen(true);
            }
        };

        fetchData();
    }, []);

    // After guide closes, check if profile setup needed
    useEffect(() => {
        if (!isGuideOpen && userId) {
            const checkProfile = async () => {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', userId)
                    .single();
                if (!profile?.full_name) {
                    setTimeout(() => setIsProfileSetupOpen(true), 500);
                }
            };
            if (localStorage.getItem('hasSeenGuide') === 'true') {
                checkProfile();
            }
        }
    }, [isGuideOpen, userId]);

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            {/* ============================================= */}
            {/* WELCOME HEADER                                */}
            {/* ============================================= */}
            <section className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                            {getGreeting()}, {userName}
                        </h1>
                        <p className="text-white/40 mt-1 text-sm sm:text-base">
                            Here is what is happening with your reading today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsGuideOpen(true)}
                            className="p-2 rounded-xl bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                            title="How ApicBooks works"
                        >
                            <Info className="w-4 h-4" />
                        </button>
                        <StreakBadge currentStreak={userStats.streak} size="sm" />
                    </div>
                </div>
            </section>

            {/* ============================================= */}
            {/* CURRENTLY READING - Horizontal Scroll          */}
            {/* ============================================= */}
            {loadingBooks ? (
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-display font-semibold text-white">Currently Reading</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex-shrink-0 w-44 animate-pulse">
                                <div className="w-full h-56 rounded-xl bg-white/[0.06]" />
                                <div className="h-4 w-3/4 bg-white/[0.06] rounded mt-3" />
                                <div className="h-3 w-1/2 bg-white/[0.03] rounded mt-1.5" />
                            </div>
                        ))}
                    </div>
                </section>
            ) : readingBooks.length > 0 ? (
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-amber-400" />
                            Currently Reading
                        </h2>
                        <Link
                            href="/my-books"
                            className="text-sm text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
                        >
                            View all <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-thin">
                        {readingBooks.map((book) => (
                            <ReadingBookCardItem key={book.id} book={book} />
                        ))}
                        {/* Add Book Card */}
                        <Link
                            href="/discover"
                            className="flex-shrink-0 w-44 h-56 rounded-xl border-2 border-dashed border-white/[0.06] hover:border-amber-500/30
                                flex flex-col items-center justify-center gap-2 text-white/30 hover:text-amber-400
                                transition-all duration-200 hover:bg-white/[0.03] group"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/[0.06] group-hover:bg-amber-500/10 flex items-center justify-center transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium">Add a book</span>
                        </Link>
                    </div>
                </section>
            ) : (
                <section className="mb-8">
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Start Your Reading Journey</h3>
                        <p className="text-white/40 max-w-sm mx-auto mb-6 text-sm">
                            Discover your next favorite book and track your reading progress.
                        </p>
                        <Link
                            href="/discover"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-black rounded-xl
                                font-medium text-sm hover:bg-amber-400 transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Discover Books
                        </Link>
                    </div>
                </section>
            )}

            {/* ============================================= */}
            {/* MAIN GRID: Feed + Sidebar                      */}
            {/* ============================================= */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* ========== LEFT COLUMN - Main content ========== */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Overview */}
                    <StatsWidget />

                    {/* Currently Reading - Full Detail */}
                    <CurrentlyReading />

                    {/* For You Feed */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                For You
                            </h2>
                        </div>
                        <ActivityFeed limit={10} showHeader={false} />
                    </section>

                    {/* Recommendations */}
                    {hasFinishedOnboarding ? (
                        <div className="space-y-8 pb-8">
                            <SmartRecommendations />
                            <BestSellersList />
                        </div>
                    ) : (
                        <div className="py-10 text-center bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl border-dashed">
                            <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-3" />
                            <h3 className="text-base font-semibold text-white">Personalized Recommendations</h3>
                            <p className="text-white/40 max-w-sm mx-auto text-sm mt-1">
                                Complete your profile setup to get personalized book suggestions.
                            </p>
                        </div>
                    )}
                </div>

                {/* ========== RIGHT COLUMN - Sidebar widgets ========== */}
                <div className="space-y-6">
                    {/* Reading Goal */}
                    <ReadingGoalCircle
                        booksRead={userStats.booksRead}
                        goalBooks={userStats.goal}
                    />

                    {/* Weekly Reading Analytics */}
                    <ReadingAnalytics />

                    {/* Quick Actions */}
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <QuickAction
                                icon={Plus}
                                label="Add a book"
                                href="/discover"
                                color="amber"
                            />
                            <QuickAction
                                icon={Users}
                                label="Join a club"
                                href="/friends"
                                color="violet"
                            />
                            <QuickAction
                                icon={Bookmark}
                                label="Create a folio"
                                href="/pulse"
                                color="default"
                            />
                        </div>
                    </div>

                    {/* Trending in Clubs */}
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-amber-400" />
                                Trending in Your Clubs
                            </h3>
                            <Link
                                href="/friends"
                                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                            >
                                See all
                            </Link>
                        </div>
                        <TrendingClubBooks />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <FeaturesGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
            <ProfileSetupModal
                isOpen={isProfileSetupOpen}
                userId={userId}
                onComplete={() => {
                    setIsProfileSetupOpen(false);
                    window.location.reload();
                }}
            />
        </div>
    );
}

// ---------- Trending Club Books Mini Widget ----------

function TrendingClubBooks() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchTrending = async () => {
            // Try to fetch popular books from the community (most added recently)
            const { data } = await supabase
                .from('user_library')
                .select(`
                    book_id,
                    book:books (title, authors, cover_url)
                `)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data && data.length > 0) {
                // Deduplicate by book_id and take top 4
                const seen = new Set<string>();
                const unique: any[] = [];
                for (const item of data) {
                    if (!seen.has(item.book_id) && item.book) {
                        seen.add(item.book_id);
                        unique.push({
                            id: item.book_id,
                            title: (item.book as any).title,
                            author: (item.book as any).authors?.[0] || 'Unknown',
                            cover_url: (item.book as any).cover_url,
                        });
                    }
                    if (unique.length >= 4) break;
                }
                setBooks(unique);
            }
            setLoading(false);
        };

        fetchTrending();
    }, []);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-9 h-12 rounded bg-white/[0.06] flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-3/4 bg-white/[0.06] rounded" />
                            <div className="h-2.5 w-1/2 bg-white/[0.03] rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <div className="text-center py-6">
                <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/30">Join clubs to see trending books here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {books.map((book, index) => (
                <Link
                    key={book.id}
                    href={`/book/${book.id}`}
                    className="flex items-center gap-3 group p-2 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                    <span className="text-xs font-bold text-white/30 w-4 text-center flex-shrink-0">
                        {index + 1}
                    </span>
                    {book.cover_url ? (
                        <div className="relative w-9 h-12 rounded overflow-hidden flex-shrink-0 shadow-book">
                            <Image
                                src={book.cover_url}
                                alt={book.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-9 h-12 rounded bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-white/30" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                            {book.title}
                        </p>
                        <p className="text-xs text-white/40 truncate">{book.author}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

// ---------- Page Export ----------

export default function DashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-3 border-white/[0.06] border-t-amber-500 animate-spin" />
                        <p className="text-white/40 text-sm">Loading your dashboard...</p>
                    </div>
                </div>
            }
        >
            <DashboardContent />
        </Suspense>
    );
}
