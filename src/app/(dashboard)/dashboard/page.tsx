'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Sparkles, TrendingUp, Info, Flame } from 'lucide-react';
import StatsWidget from '@/components/dashboard/StatsWidget';
import CurrentlyReading from '@/components/dashboard/CurrentlyReading';
import BestSellersList from '@/components/dashboard/BestSellersList';
import FeaturesGuideModal from '@/components/dashboard/FeaturesGuideModal';
import ProfileSetupModal from '@/components/dashboard/ProfileSetupModal';
import ReadingAnalytics from '@/components/dashboard/ReadingAnalytics';
import SmartRecommendations from '@/components/dashboard/SmartRecommendations';
import StreakBadge from '@/components/StreakBadge';
import { ReadingGoalCompact } from '@/components/ReadingGoalProgress';
import type { BookWithPrices } from '@/types';
import Link from 'next/link';
import { useStreak } from '@/lib/hooks/useStreak';
import { createClient } from '@/lib/supabase/client';

function HomeContent() {
    useStreak(); // Check and update streak logic
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [searchResults, setSearchResults] = useState<BookWithPrices[]>([]);
    const [moodResults, setMoodResults] = useState<BookWithPrices[]>([]);
    const [aiExplanation, setAiExplanation] = useState<string>('');
    const [isSearching, setIsSearching] = useState(false);
    const [isMoodSearching, setIsMoodSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [error, setError] = useState<string | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false); // New State
    const [userName, setUserName] = useState('Reader');
    const [userId, setUserId] = useState(''); // Store user ID
    const [userStats, setUserStats] = useState({ streak: 0, longestStreak: 0, booksRead: 0, goal: 12 });

    const supabase = createClient();

    // Fetch user stats
    useEffect(() => {
        const fetchUserStats = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Get profile for streak and name
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, current_streak, longest_streak, reading_goal, favorite_genres')
                .eq('id', user.id)
                .single();

            const hasFinishedOnboarding = profile?.full_name && profile?.favorite_genres && profile.favorite_genres.length > 0;

            if (profile?.full_name) {
                // Get first name
                setUserName(profile.full_name.split(' ')[0]);
            } else {
                // If no name/onboarding, trigger flow (unless guide is showing)
                // We'll let guide finish first if it matches logic below
            }

            // Get completed books count for current year
            const year = new Date().getFullYear();
            const { count } = await supabase
                .from('user_library')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .gte('updated_at', `${year}-01-01`);

            setUserStats({
                streak: profile?.current_streak || 0,
                longestStreak: profile?.longest_streak || 0,
                booksRead: count || 0,
                goal: profile?.reading_goal || 12
            });

            // Check for new user guide
            const hasSeen = localStorage.getItem('hasSeenGuide');
            if (!hasSeen) {
                setTimeout(() => {
                    setIsGuideOpen(true);
                    localStorage.setItem('hasSeenGuide', 'true');
                    // On close of guide (handled via isGuideOpen effect or callback), we could trigger setup
                    // For now, if they haven't seen guide, we show it. 
                    // AND if they haven't finished onboarding, we show that AFTER guide (or concurrently if we want).
                    // Logic: If guide is open, don't show setup yet.

                }, 1000);
            } else if (!hasFinishedOnboarding) {
                setIsProfileSetupOpen(true);
            }
        };

        fetchUserStats();
    }, []);

    // Watch guide state to trigger setup if needed
    useEffect(() => {
        if (!isGuideOpen && userId) {
            // Check again if we need setup (if we just closed guide)
            // simplified: we handled "else if (!hasFinishedOnboarding)" in main effect
            // but if guide was just closed, we might need to separate the check.
            // Actually, simplest is: One-time check in main effect is enough if hasSeen=true. 
            // If hasSeen=false, we show guide. When guide closes, we should check again? 
            // Ideally we pass a callback to GuideModal, but we can just use this effect:
            const checkProfile = async () => {
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
                if (!profile?.full_name) {
                    // small delay
                    setTimeout(() => setIsProfileSetupOpen(true), 500);
                }
            };
            // Only run this if we know we are logged in and guide just closed (from true to false)
            // But we don't track "previous" state easily here without ref.
            // Let's just rely on the main effect for returning users, 
            // and for new users, we can just let them click stats or reload? 
            // No, better user experience:
            // Let's add the check here safely.
            if (localStorage.getItem('hasSeenGuide') === 'true') {
                checkProfile();
            }
        }
    }, [isGuideOpen, userId]);

    // Perform search when query param changes
    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        }
    }, [initialQuery]);

    const performSearch = useCallback(async (query: string) => {
        setIsSearching(true);
        setError(null);
        setSearchQuery(query);
        setMoodResults([]);
        setAiExplanation('');

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.success) {
                setSearchResults(data.data.books);
            } else {
                setError(data.error || 'Failed to search');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleMoodSearch = useCallback(async (mood: string) => {
        setIsMoodSearching(true);
        setError(null);
        setSearchResults([]);
        setSearchQuery('');

        try {
            const response = await fetch('/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood }),
            });
            const data = await response.json();

            if (data.success) {
                setMoodResults(data.data.books);
                setAiExplanation(data.data.aiExplanation);
            } else {
                setError(data.error || 'Failed to get recommendations');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setIsMoodSearching(false);
        }
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                        <span className="gradient-text">Overview</span>
                        <button
                            onClick={() => setIsGuideOpen(true)}
                            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            title="How ApicBooks works"
                        >
                            <Info className="w-4 h-4" />
                        </button>
                    </h1>
                    <p className="text-slate-400">Welcome back, {userName}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/discover"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-105 transition-all font-medium text-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        Discover
                    </Link>
                    <Link
                        href="/my-books"
                        className="flex items-center gap-2 px-4 py-2 bg-[#141b3d] border border-[#1e2749] text-white rounded-xl hover:bg-[#1e2749] transition-all font-medium text-sm"
                    >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        My Books
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <StatsWidget />

            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Currently Reading */}
                    <CurrentlyReading />
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Weekly Reading Analytics */}
                    <ReadingAnalytics />

                    {/* Streak & Reading Goal */}
                    <div className="bg-card border border-card-border rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Your Progress</h3>
                            <StreakBadge currentStreak={userStats.streak} size="sm" />
                        </div>
                        <ReadingGoalCompact booksRead={userStats.booksRead} goalBooks={userStats.goal} />
                    </div>
                </div>
            </div>

            {/* Recommendations & Discovery Section */}
            {userName !== 'Reader' ? (
                <div className="space-y-8 pb-12 animate-fade-in">
                    <SmartRecommendations />
                    <BestSellersList />
                </div>
            ) : (
                <div className="py-12 text-center space-y-4 bg-[#141b3d]/30 border border-[#1e2749] rounded-2xl border-dashed">
                    <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
                    <div>
                        <h3 className="text-lg font-semibold text-white">Recommendations Paused</h3>
                        <p className="text-slate-400 max-w-sm mx-auto">Complete your profile setup to get personalized book suggestions.</p>
                    </div>
                </div>
            )}

            <FeaturesGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
            <ProfileSetupModal
                isOpen={isProfileSetupOpen}
                userId={userId}
                onComplete={() => {
                    setIsProfileSetupOpen(false);
                    // Refresh stats/name essentially by reloading window or re-triggering fetch (simplified: reload)
                    window.location.reload();
                }}
            />
        </div>
    );
}


export default function Home() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin" />
                    <p className="text-slate-400">Loading ApicBooks...</p>
                </div>
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}
