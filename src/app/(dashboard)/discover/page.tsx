'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import BookCard, { BookCardSkeleton } from '@/components/BookCard';
import { Sparkles, Search as SearchIcon, BookOpen, Loader2 } from 'lucide-react';
import SectionGuideButton from '@/components/dashboard/SectionGuideButton';
import { addAffiliateTags } from '@/lib/utils/affiliate';

import { useSearch } from '@/contexts/SearchContext';
import { useCurrency } from '@/contexts/CurrencyContext';

function DiscoverContent() {
    const {
        searchResults, setSearchResults,
        query: searchQuery, setQuery: setSearchQuery,
        mood: moodQuery, setMood: setMoodQuery,
        aiExplanation, setAiExplanation,
        mode, setMode,
        isSearching: loading, setIsSearching: setLoading
    } = useSearch();

    const { region } = useCurrency();
    const [error, setError] = useState<string | null>(null);
    const [moodInput, setMoodInput] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const q = searchParams.get('q');
    const mood = searchParams.get('mood');
    const [prevRegion, setPrevRegion] = useState(region);

    // Sync URL with Context
    useEffect(() => {
        if (q) {
            handleSearch(q);
        } else if (mood) {
            handleMoodSearch(mood);
        } else if (region !== prevRegion) {
            setPrevRegion(region);
            if (searchQuery && mode === 'search') handleSearch(searchQuery);
            else if (moodQuery && mode === 'mood') handleMoodSearch(moodQuery);
        }
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
                const books = data.data.books.map((book: any) => ({
                    ...book,
                    prices: book.prices?.map((p: any) => ({ ...p, link: addAffiliateTags(p.link) }))
                }));
                setSearchResults(books);
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
                    setError("We couldn't find any specific books matching that mood.");
                    setSearchResults([]);
                } else {
                    setSearchResults(data.data.books);
                    setAiExplanation(data.data.aiExplanation || '');
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
        <div className="max-w-7xl mx-auto min-h-screen pb-20 animate-fade-in relative">
            {/* Background Gradients - Soft & Subtle */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Header Section */}
            <header className="pt-8 px-4 mb-16 text-center md:text-left md:flex md:items-end md:justify-between">
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground dark:text-white mb-3">
                        Discover
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Find your next obsession from millions of books.
                    </p>
                </div>

                {/* Trending Pills - Vibrant & Borderless */}
                <div className="hidden md:flex flex-wrap gap-2 mt-4 md:mt-0">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest py-1.5 mr-2">Trending:</span>
                    {['Atomic Habits', 'Fourth Wing', 'It Ends with Us'].map(term => (
                        <button
                            key={term}
                            onClick={() => router.push(`/discover?q=${encodeURIComponent(term)}`)}
                            className="px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-all hover:-translate-y-0.5"
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Search Area - Clean & Borderless */}
            <div className="max-w-4xl mx-auto px-4 mb-24 space-y-12">

                {/* 1. Standard Search - Minimalist Bar */}
                <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                    <div className="relative flex items-center bg-white dark:bg-[#1e1b2e] rounded-2xl p-2 shadow-sm shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-white/5">
                        <SearchIcon className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                        <input
                            type="text"
                            placeholder="Title, author, or ISBN..."
                            className="flex-1 bg-transparent border-none text-foreground dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-0 text-lg py-3 px-4"
                            defaultValue={searchQuery}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value;
                                    if (val.trim()) router.push(`/discover?q=${encodeURIComponent(val)}`);
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                const val = (document.querySelector('input[type="text"]') as HTMLInputElement)?.value;
                                if (val?.trim()) router.push(`/discover?q=${encodeURIComponent(val)}`);
                            }}
                            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-transform hover:scale-[1.02]"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* 2. Ask Anika - Chat Style Interface */}
                <div className="relative">
                    <div className="text-center mb-8">
                        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-300 text-xs font-bold uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            AI Companion
                        </div>

                        <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100">
                            Find your perfect match
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-end md:items-start gap-6 justify-center max-w-4xl mx-auto">

                        {/* Anika Avatar - Floating */}
                        <div className="relative shrink-0 w-32 h-32 md:w-40 md:h-40 animate-bounce-slow z-10">
                            <img
                                src="/anika_avatar.png"
                                alt="Anika AI"
                                className="w-full h-full object-contain drop-shadow-2xl"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            <div className="hidden w-full h-full bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white dark:border-slate-800">
                                <Sparkles className="w-16 h-16" />
                            </div>

                            {/* Name Tag */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-md text-xs font-bold text-violet-600 dark:text-violet-300 border border-violet-100 dark:border-violet-500/30 whitespace-nowrap">
                                Anika AI
                            </div>
                        </div>

                        {/* Chat Bubble & Input */}
                        <div className="flex-1 w-full max-w-2xl">
                            {/* Speech Bubble */}
                            <div className="relative bg-white dark:bg-[#1e1b2e] p-6 rounded-3xl rounded-tl-none shadow-xl shadow-violet-500/5 mb-4 border border-violet-100 dark:border-violet-500/20">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                    Hi there! I'm Anika. <span className="text-2xl">👋</span>
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 mb-6">
                                    Tell me what you're in the mood for! I love specific tropes like <span className="font-semibold text-violet-600 dark:text-violet-400">"Enemies to lovers"</span> or <span className="font-semibold text-violet-600 dark:text-violet-400">"Space opera with found family"</span>.
                                </p>

                                {/* Floating Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={moodInput}
                                        onChange={(e) => setMoodInput(e.target.value)}
                                        placeholder="e.g. A cozy mystery with a cat..."
                                        className="w-full p-4 pr-32 bg-slate-50 dark:bg-[#151221] rounded-xl text-foreground dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all border border-slate-200 dark:border-slate-800"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && moodInput.trim()) router.push(`/discover?mood=${encodeURIComponent(moodInput)}`);
                                        }}
                                    />
                                    <button
                                        onClick={() => { if (moodInput.trim()) router.push(`/discover?mood=${encodeURIComponent(moodInput)}`); }}
                                        disabled={loading}
                                        className="absolute right-2 top-2 bottom-2 px-5 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                                    >
                                        {loading && mode === 'mood' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                            <>Send <Sparkles className="w-3 h-3" /></>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Trope Chips */}
                            <div className="flex flex-wrap gap-2 animate-fade-in pl-4">
                                {['Enemies to Lovers', 'Found Family', 'Cyberpunk', 'Whodunnit', 'Dark Academia', 'Slow Burn'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            setMoodInput(tag);
                                        }}
                                        className="px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 hover:border-violet-200 dark:hover:border-violet-500/30 transition-all hover:-translate-y-0.5"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {(loading || searchResults.length > 0 || error) && (
                <div id="results-section" className="border-t border-slate-100 dark:border-white/5 pt-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-foreground dark:text-white">
                                {loading ? 'Searching...' : mode === 'mood' ? 'Recommendations' : 'Results'}
                            </h2>
                            {!loading && searchResults.length > 0 && (
                                <span className="text-sm text-slate-500">{searchResults.length} books found</span>
                            )}
                        </div>

                        {mode === 'mood' && !loading && searchResults.length > 0 && (
                            <div className="mb-8 p-6 rounded-2xl bg-violet-50 dark:bg-violet-900/10 text-slate-700 dark:text-slate-200">
                                <div className="flex gap-3">
                                    <Sparkles className="w-5 h-5 text-violet-500 mt-1 shrink-0" />
                                    <p className="text-lg leading-relaxed">{aiExplanation || "Here are some books matching your vibe."}</p>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {[...Array(10)].map((_, i) => <BookCardSkeleton key={i} />)}
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">No matches found</h3>
                                <p className="text-slate-500">{error}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in-up">
                                {searchResults.map((book, i) => (
                                    <div key={book.id} style={{ animationDelay: `${i * 50}ms` }}>
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
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
            </div>
        }>
            <DiscoverContent />
        </Suspense>
    );
}
