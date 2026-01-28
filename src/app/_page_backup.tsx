'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Sparkles, TrendingUp, Search as SearchIcon, Zap, ArrowRight, Star } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import MoodSearch from '@/components/MoodSearch';
import BookCard, { BookCardSkeleton } from '@/components/BookCard';

import TrendingSearches from '@/components/sections/TrendingSearches';
import RetailerLogos from '@/components/sections/RetailerLogos';
import Testimonials from '@/components/sections/Testimonials';
import CTASection from '@/components/sections/CTASection';
import type { BookWithPrices } from '@/types';


import StatsWidget from '@/components/dashboard/StatsWidget';
import CurrentlyReading from '@/components/dashboard/CurrentlyReading';

function HomeContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [searchResults, setSearchResults] = useState<BookWithPrices[]>([]);
    const [moodResults, setMoodResults] = useState<BookWithPrices[]>([]);
    const [aiExplanation, setAiExplanation] = useState<string>('');
    const [isSearching, setIsSearching] = useState(false);
    const [isMoodSearching, setIsMoodSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [error, setError] = useState<string | null>(null);

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

    const hasResults = searchResults.length > 0 || moodResults.length > 0;
    const displayResults = searchResults.length > 0 ? searchResults : moodResults;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Overview</h1>
                    <p className="text-slate-400">Welcome back, Reader</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    System Online
                </div>
            </div>

            {/* Stats Overview */}
            <StatsWidget />

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Currently Reading */}
                    <CurrentlyReading />
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Trending List (Simplified) - Keeping for now as it's not strictly 'search' but discovery */}
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Trending Now</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: "Fourth Wing", author: "Rebecca Yarros", price: "$14.99" },
                                { title: "Atomic Habits", author: "James Clear", price: "$11.98" },
                                { title: "The Woman in Me", author: "Britney Spears", price: "$16.49" }
                            ].map((book, i) => (
                                <div key={i} className="flex items-center gap-3 group cursor-pointer hover:bg-slate-700/30 p-2 -mx-2 rounded-lg transition-colors">
                                    <div className="w-10 h-14 bg-slate-700 rounded shadow-sm flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-200 truncate group-hover:text-primary-400 transition-colors">{book.title}</div>
                                        <div className="text-xs text-slate-500 truncate">{book.author}</div>
                                    </div>
                                    <div className="text-xs font-mono text-emerald-400">{book.price}</div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors border-t border-slate-700/50">
                            View Top 100
                        </button>
                    </div>
                </div>
            </div>
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
