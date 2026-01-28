'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import BookCard, { BookCardSkeleton } from '@/components/BookCard';
import { Sparkles, Search as SearchIcon, BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import { BookWithPrices } from '@/types';
import SectionGuideButton from '@/components/dashboard/SectionGuideButton';
import { addAffiliateTags } from '@/lib/utils/affiliate';

import { useSearch } from '@/contexts/SearchContext';
import { useCurrency } from '@/contexts/CurrencyContext';

function DiscoverContent() {
    // Use global search state instead of local state
    const {
        searchResults, setSearchResults,
        query: searchQuery, setQuery: setSearchQuery,
        mood: moodQuery, setMood: setMoodQuery,
        aiExplanation, setAiExplanation,
        mode, setMode,
        isSearching: loading, setIsSearching: setLoading
    } = useSearch();

    // Get region from context
    const { region } = useCurrency();

    const [error, setError] = useState<string | null>(null);
    const [moodInput, setMoodInput] = useState('');
    const router = useRouter();

    const searchParams = useSearchParams();
    const q = searchParams.get('q');
    const mood = searchParams.get('mood');

    // Track previous region to detect actual changes
    const [prevRegion, setPrevRegion] = useState(region);

    // Sync URL with Context on load/change
    useEffect(() => {
        // If URL has query param, use it
        if (q) {
            handleSearch(q);
        } else if (mood) {
            handleMoodSearch(mood);
        } else if (region !== prevRegion) {
            // Only re-fetch if region actually changed
            setPrevRegion(region);
            if (searchQuery && mode === 'search') {
                handleSearch(searchQuery);
            } else if (moodQuery && mode === 'mood') {
                handleMoodSearch(moodQuery);
            }
        }
        // Note: If returning to page with no URL params and same region, 
        // searchResults from context will be displayed without re-fetching
    }, [q, mood, region]);

    const handleSearch = async (term: string) => {
        setLoading(true);
        setError(null);
        setMode('search');
        setSearchQuery(term);
        setAiExplanation('');

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&region=${region}`);
            const data = await res.json();
            if (data.success) {
                const booksWithAffiliate = data.data.books.map((book: any) => ({
                    ...book,
                    prices: book.prices?.map((p: any) => ({ ...p, link: addAffiliateTags(p.link) }))
                }));
                setSearchResults(booksWithAffiliate);
            } else {
                setError(data.error);
                setSearchResults([]);
            }
        } catch (e) {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMoodSearch = async (moodText: string) => {
        setLoading(true);
        setError(null);
        setMode('mood');
        setMoodQuery(moodText);

        try {
            const res = await fetch('/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood: moodText, region })
            });
            const data = await res.json();
            if (data.success) {
                if (data.data.books.length === 0) {
                    setError("We couldn't find any specific books matching that mood. Try a different description!");
                    setSearchResults([]);
                } else {
                    setSearchResults(data.data.books);
                    setAiExplanation(data.data.aiExplanation || '');
                    // Scroll to results section after a brief delay
                    setTimeout(() => {
                        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError('Mood search failed.');
        } finally {
            setLoading(false);
        }
    };

    const moodTags = ['Mysterious', 'Uplifting', 'Adventurous', 'Romantic', 'Intellectual', 'Dark', 'Cozy', 'Thrilling'];

    return (
        <div className="max-w-7xl mx-auto min-h-screen pb-10 space-y-6 animate-fade-in">
            {/* Premium Header & Hero Section */}
            <div className="relative pt-6 px-4 mb-6">
                <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary-900/20 via-transparent to-transparent -z-10" />

                <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white flex items-center gap-3 mb-2">
                            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-sm">
                                Discover
                            </span>
                            <SectionGuideButton section="discover" />
                        </h1>
                        <p className="text-slate-400 text-base">Find your next obsession from millions of books</p>
                    </div>

                    {/* Trending Pills */}
                    <div className="flex flex-wrap gap-2 justify-end">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-1.5">Trending:</span>
                        {['Atomic Habits', 'Fourth Wing', 'It Ends with Us'].map(term => (
                            <button
                                key={term}
                                onClick={() => router.push(`/discover?q=${encodeURIComponent(term)}`)}
                                className="px-3 py-1 rounded-full bg-[#1e2749]/50 border border-[#2d3a6e] text-xs text-slate-300 hover:text-white hover:border-primary-400/50 transition-all hover:shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hero Search Bar */}
                <div className="w-full max-w-4xl mx-auto relative mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-xl blur opacity-30 animate-pulse" />
                    <div className="relative flex items-center gap-2 p-1.5 bg-[#0a0e27]/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
                        <SearchIcon className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by title, author, or ISBN..."
                            className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-base py-2.5"
                            defaultValue={searchQuery}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const value = (e.target as HTMLInputElement).value;
                                    if (value.trim()) {
                                        router.push(`/discover?q=${encodeURIComponent(value)}`);
                                    }
                                }
                            }}
                        />

                        {/* Mood AI Toggle */}
                        <button
                            onClick={() => document.getElementById('anika-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-lg text-violet-300 hover:text-white hover:border-violet-400 transition-all text-xs font-medium"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Ask AI</span>
                        </button>

                        <button
                            onClick={() => {
                                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                if (input?.value.trim()) {
                                    router.push(`/discover?q=${encodeURIComponent(input.value)}`);
                                }
                            }}
                            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 text-sm"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Ask Anika AI Section - Compact Premium Card */}
            <div id="anika-section" className="max-w-5xl mx-auto px-4 mb-8">
                <div className="relative group rounded-2xl p-[1px] bg-gradient-to-br from-violet-500/50 via-fuchsia-500/50 to-cyan-500/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />

                    <div className="relative bg-[#0a0e27] rounded-[15px] overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/20 blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/20 blur-[80px]" />

                        <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6 items-center relative z-10">
                            <div className="text-left shrink-0 md:w-1/3">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-bold uppercase tracking-widest mb-2">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    AI Powered
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Ask Anika</h2>
                                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-none">
                                    Describe your mood, setting, or favorite tropes for a perfect match.
                                </p>
                            </div>

                            {/* Input Area */}
                            <div className="flex-1 w-full space-y-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={moodInput}
                                        onChange={(e) => setMoodInput(e.target.value)}
                                        placeholder="e.g. A dark academic thriller with a twist..."
                                        className="w-full p-3 pr-24 bg-[#141b3d]/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-[#141b3d] transition-all text-sm shadow-inner"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && moodInput.trim()) {
                                                router.push(`/discover?mood=${encodeURIComponent(moodInput)}`);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (moodInput.trim()) {
                                                router.push(`/discover?mood=${encodeURIComponent(moodInput)}`);
                                            }
                                        }}
                                        disabled={loading}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 flex items-center justify-center transform active:scale-95 text-sm"
                                    >
                                        {loading && mode === 'mood' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
                                    </button>
                                </div>

                                {/* Aesthetic Mood Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                    {moodTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                setMoodInput(tag);
                                                router.push(`/discover?mood=${encodeURIComponent(tag)}`);
                                            }}
                                            className="px-3 py-1 rounded-md bg-[#1e2749]/30 border border-white/5 text-xs text-slate-400 hover:text-white hover:bg-violet-500/20 hover:border-violet-500/30 transition-all hover:-translate-y-0.5"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {(loading || searchResults.length > 0 || error) && (
                <div id="results-section" className="pt-6 border-t border-[#1e2749]">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                                    {loading ? 'Searching...' : mode === 'mood' ? 'Recommendations' : 'Search Results'}
                                </h2>
                                {mode === 'mood' && !loading && searchResults.length > 0 && (
                                    <div className="mt-2 text-slate-300 text-sm p-4 bg-accent-500/5 border border-accent-500/20 rounded-xl">
                                        <div className="flex gap-2">
                                            <Sparkles className="w-4 h-4 text-accent-400 mt-0.5 shrink-0" />
                                            <p>{aiExplanation || "Here are the best matches for your mood."}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!loading && searchResults.length > 0 && (
                                <span className="text-xs md:text-sm text-slate-400">
                                    {searchResults.length} books found
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {[...Array(12)].map((_, i) => <BookCardSkeleton key={i} />)}
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No Results Found</h3>
                                <p className="text-slate-400 max-w-md text-sm">{error}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in-up">
                                {searchResults.map((book, index) => (
                                    <div key={book.id} style={{ animationDelay: `${index * 50}ms` }}>
                                        <BookCard book={book} showPrices={true} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DiscoverPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    <p className="text-slate-400">Loading Discover...</p>
                </div>
            </div>
        }>
            <DiscoverContent />
        </Suspense>
    );
}
