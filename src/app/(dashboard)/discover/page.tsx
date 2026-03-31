'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookCard, { BookCardSkeleton } from '@/components/BookCard';
import {
    Sparkles, Search as SearchIcon, BookOpen, TrendingUp, Loader2,
    ArrowRight, Heart, Skull, Rocket, Wand2, Mountain, User, Brain,
    Clock, Feather, ChevronLeft, ChevronRight, ListMusic, Star, Compass
} from 'lucide-react';
import type { BookWithPrices } from '@/types';
import SectionGuideButton from '@/components/dashboard/SectionGuideButton';
import { addAffiliateTags } from '@/lib/utils/affiliate';
import { useSearch } from '@/contexts/SearchContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Image from 'next/image';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Genre card data
// ---------------------------------------------------------------------------
interface GenreCard {
    name: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    query: string;
}

const GENRE_CARDS: GenreCard[] = [
    { name: 'Fiction', icon: <BookOpen className="w-6 h-6" />, color: 'bg-amber-500/10 text-amber-400', borderColor: 'border-amber-500/20 hover:border-amber-500/40', query: 'fiction bestsellers' },
    { name: 'Mystery', icon: <Skull className="w-6 h-6" />, color: 'bg-rose-500/10 text-rose-400', borderColor: 'border-rose-500/20 hover:border-rose-500/40', query: 'mystery thriller bestsellers' },
    { name: 'Romance', icon: <Heart className="w-6 h-6" />, color: 'bg-pink-500/10 text-pink-400', borderColor: 'border-pink-500/20 hover:border-pink-500/40', query: 'romance novels bestsellers' },
    { name: 'Sci-Fi', icon: <Rocket className="w-6 h-6" />, color: 'bg-violet-500/10 text-violet-400', borderColor: 'border-violet-500/20 hover:border-violet-500/40', query: 'science fiction bestsellers' },
    { name: 'Fantasy', icon: <Wand2 className="w-6 h-6" />, color: 'bg-indigo-500/10 text-indigo-400', borderColor: 'border-indigo-500/20 hover:border-indigo-500/40', query: 'fantasy novels bestsellers' },
    { name: 'Biography', icon: <User className="w-6 h-6" />, color: 'bg-sky-500/10 text-sky-400', borderColor: 'border-sky-500/20 hover:border-sky-500/40', query: 'biography memoir bestsellers' },
    { name: 'Self-Help', icon: <Brain className="w-6 h-6" />, color: 'bg-emerald-500/10 text-emerald-400', borderColor: 'border-emerald-500/20 hover:border-emerald-500/40', query: 'self help personal development' },
    { name: 'History', icon: <Clock className="w-6 h-6" />, color: 'bg-orange-500/10 text-orange-400', borderColor: 'border-orange-500/20 hover:border-orange-500/40', query: 'history nonfiction bestsellers' },
    { name: 'Philosophy', icon: <Compass className="w-6 h-6" />, color: 'bg-stone-400/10 text-stone-300', borderColor: 'border-stone-400/20 hover:border-stone-400/40', query: 'philosophy books' },
    { name: 'Poetry', icon: <Feather className="w-6 h-6" />, color: 'bg-rose-500/10 text-rose-400', borderColor: 'border-rose-500/20 hover:border-rose-500/40', query: 'poetry collections' },
];

// ---------------------------------------------------------------------------
// Popular Folio placeholders
// ---------------------------------------------------------------------------
interface Folio {
    id: string;
    title: string;
    curator: string;
    bookCount: number;
    coverImages: string[];
    description: string;
}

const POPULAR_FOLIOS: Folio[] = [
    {
        id: 'folio-1',
        title: 'Books That Changed My Worldview',
        curator: 'Sarah M.',
        bookCount: 12,
        coverImages: [
            'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg',
            'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg',
            'https://covers.openlibrary.org/b/isbn/9780593135204-M.jpg',
        ],
        description: 'A curated list of non-fiction that will reshape how you see the world.',
    },
    {
        id: 'folio-2',
        title: 'Cozy Autumn Reads',
        curator: 'James T.',
        bookCount: 8,
        coverImages: [
            'https://covers.openlibrary.org/b/isbn/9780593321201-M.jpg',
            'https://covers.openlibrary.org/b/isbn/9780593356159-M.jpg',
            'https://covers.openlibrary.org/b/isbn/9780593336472-M.jpg',
        ],
        description: 'Warm stories perfect for a rainy day with a cup of tea.',
    },
    {
        id: 'folio-3',
        title: 'Mind-Bending Sci-Fi',
        curator: 'Priya K.',
        bookCount: 15,
        coverImages: [
            'https://covers.openlibrary.org/b/isbn/9780593135204-M.jpg',
            'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg',
            'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg',
        ],
        description: 'Stories that push the boundaries of imagination and science.',
    },
];

// ---------------------------------------------------------------------------
// Horizontal scroll helper
// ---------------------------------------------------------------------------
function HorizontalScroll({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 2);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        el?.addEventListener('scroll', checkScroll, { passive: true });
        return () => el?.removeEventListener('scroll', checkScroll);
    }, [children]);

    const scroll = (dir: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    };

    return (
        <div className="relative group">
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface border border-white/[0.06] flex items-center justify-center text-white hover:bg-surface-light transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}
            <div ref={scrollRef} className={`flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth ${className}`}>
                {children}
            </div>
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface border border-white/[0.06] flex items-center justify-center text-white hover:bg-surface-light transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// DiscoverContent
// ---------------------------------------------------------------------------
function DiscoverContent() {
    const {
        searchResults, setSearchResults,
        query: searchQuery, setQuery: setSearchQuery,
        mood: moodQuery, setMood: setMoodQuery,
        aiExplanation, setAiExplanation,
        mode, setMode,
        isSearching: loading, setIsSearching: setLoading,
    } = useSearch();

    const { region } = useCurrency();
    const router = useRouter();
    const searchParams = useSearchParams();
    const q = searchParams.get('q');
    const mood = searchParams.get('mood');

    const [error, setError] = useState<string | null>(null);
    const [moodInput, setMoodInput] = useState('');
    const [heroSearchValue, setHeroSearchValue] = useState('');

    const [trendingBooks, setTrendingBooks] = useState<BookWithPrices[]>([]);
    const [trendingLoading, setTrendingLoading] = useState(true);

    const [nytBooks, setNytBooks] = useState<BookWithPrices[]>([]);
    const [nytLoading, setNytLoading] = useState(true);

    const [moodResults, setMoodResults] = useState<BookWithPrices[]>([]);
    const [moodExplanation, setMoodExplanation] = useState('');
    const [moodLoading, setMoodLoading] = useState(false);

    const [prevRegion, setPrevRegion] = useState(region);

    useEffect(() => {
        const fetchTrending = async () => {
            setTrendingLoading(true);
            try {
                const res = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ q: 'trending books 2024' }),
                });
                const data = await res.json();
                if (data.success && data.data?.books) {
                    setTrendingBooks(data.data.books.slice(0, 12));
                } else if (data.results) {
                    setTrendingBooks(data.results.slice(0, 12));
                }
            } catch {
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent('trending books 2024')}&region=${region}`);
                    const data = await res.json();
                    if (data.success && data.data?.books) {
                        setTrendingBooks(data.data.books.slice(0, 12));
                    }
                } catch { /* silently fail */ }
            } finally {
                setTrendingLoading(false);
            }
        };

        const fetchNYT = async () => {
            setNytLoading(true);
            try {
                const res = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ q: 'new york times bestseller 2024' }),
                });
                const data = await res.json();
                if (data.success && data.data?.books) {
                    setNytBooks(data.data.books.slice(0, 15));
                } else if (data.results) {
                    setNytBooks(data.results.slice(0, 15));
                }
            } catch {
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent('NYT bestseller fiction 2024')}&region=${region}`);
                    const data = await res.json();
                    if (data.success && data.data?.books) {
                        setNytBooks(data.data.books.slice(0, 15));
                    }
                } catch { /* silently fail */ }
            } finally {
                setNytLoading(false);
            }
        };

        fetchTrending();
        fetchNYT();
    }, [region]);

    useEffect(() => {
        if (q) {
            handleSearch(q);
        } else if (mood) {
            handleMoodSearch(mood);
        } else if (region !== prevRegion) {
            setPrevRegion(region);
            if (searchQuery && mode === 'search') {
                handleSearch(searchQuery);
            } else if (moodQuery && mode === 'mood') {
                handleMoodSearch(moodQuery);
            }
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
                const booksWithAffiliate = data.data.books.map((book: any) => ({
                    ...book,
                    prices: book.prices?.map((p: any) => ({ ...p, link: addAffiliateTags(p.link) })),
                }));
                setSearchResults(booksWithAffiliate);
            } else {
                setError(data.error);
                setSearchResults([]);
            }
        } catch {
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
                body: JSON.stringify({ mood: moodText, region }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.data.books.length === 0) {
                    setError("We couldn't find books matching that mood. Try a different description!");
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
        } catch {
            setError('Mood search failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleInlineMoodSearch = async () => {
        if (!moodInput.trim()) return;
        setMoodLoading(true);
        setMoodResults([]);
        setMoodExplanation('');

        try {
            const res = await fetch('/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood: moodInput, region }),
            });
            const data = await res.json();
            if (data.success && data.data.books.length > 0) {
                setMoodResults(data.data.books);
                setMoodExplanation(data.data.aiExplanation || '');
                setTimeout(() => {
                    document.getElementById('mood-results')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } catch { /* silently fail */ }
        finally {
            setMoodLoading(false);
        }
    };

    const moodTags = ['Mysterious', 'Uplifting', 'Adventurous', 'Romantic', 'Intellectual', 'Dark', 'Cozy', 'Thrilling'];

    const showResults = loading || searchResults.length > 0 || error;

    return (
        <div className="max-w-7xl mx-auto min-h-screen pb-16 space-y-10 animate-fade-in">

            {/* HERO SECTION */}
            <section className="relative pt-4 md:pt-8 pb-2">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/8 via-violet-500/4 to-transparent rounded-full blur-3xl -z-10" />

                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
                        What do you want to read next?
                    </h1>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">
                        Search millions of books, explore genres, or let AI find the perfect match for your mood.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-violet-500/20 to-amber-500/20 rounded-2xl blur-sm opacity-60" />
                    <div className="relative flex items-center gap-2 p-1.5 bg-surface border border-white/[0.06] rounded-2xl">
                        <SearchIcon className="w-5 h-5 text-white/30 ml-4 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by title, author, or ISBN..."
                            value={heroSearchValue}
                            onChange={(e) => setHeroSearchValue(e.target.value)}
                            className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none text-base py-3"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && heroSearchValue.trim()) {
                                    router.push(`/discover?q=${encodeURIComponent(heroSearchValue)}`);
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                if (heroSearchValue.trim()) {
                                    router.push(`/discover?q=${encodeURIComponent(heroSearchValue)}`);
                                }
                            }}
                            className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl text-sm hover:bg-amber-400 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                    <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">Trending:</span>
                    {['Atomic Habits', 'Fourth Wing', 'It Ends with Us', 'Iron Flame'].map((term) => (
                        <button
                            key={term}
                            onClick={() => router.push(`/discover?q=${encodeURIComponent(term)}`)}
                            className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/40 hover:text-amber-400 hover:border-amber-500/20 transition-all"
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </section>

            {/* SEARCH RESULTS */}
            {showResults && (
                <section id="results-section" className="pt-6 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                                {loading ? 'Searching...' : mode === 'mood' ? 'AI Recommendations' : 'Search Results'}
                            </h2>
                            {mode === 'mood' && !loading && searchResults.length > 0 && aiExplanation && (
                                <div className="mt-2 text-white/60 text-sm p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                                    <div className="flex gap-2">
                                        <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                                        <p>{aiExplanation}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!loading && searchResults.length > 0 && (
                            <span className="text-xs md:text-sm text-white/30">
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
                            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                                <BookOpen className="w-6 h-6 text-rose-400" />
                            </div>
                            <h3 className="text-lg font-display font-bold text-white mb-2">No Results Found</h3>
                            <p className="text-white/40 max-w-md text-sm">{error}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in">
                            {searchResults.map((book, index) => (
                                <div key={book.id} style={{ animationDelay: `${index * 50}ms` }}>
                                    <BookCard book={book} showPrices={true} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* BROWSE BY GENRE */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-display font-bold text-white">Browse by Genre</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {GENRE_CARDS.map((genre) => (
                        <button
                            key={genre.name}
                            onClick={() => router.push(`/discover?q=${encodeURIComponent(genre.query)}`)}
                            className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all hover:-translate-y-0.5 ${genre.color} ${genre.borderColor}`}
                        >
                            <div className="transition-transform group-hover:scale-110">
                                {genre.icon}
                            </div>
                            <span className="text-sm font-semibold">{genre.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* TRENDING BOOKS */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-400" />
                        <h2 className="text-xl font-display font-bold text-white">Trending Now</h2>
                    </div>
                    <button
                        onClick={() => router.push('/discover?q=trending+books+2024')}
                        className="text-sm text-amber-400 font-medium flex items-center gap-1 hover:text-amber-300 transition-colors"
                    >
                        See all <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {trendingLoading ? (
                    <HorizontalScroll>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="shrink-0 w-44">
                                <BookCardSkeleton />
                            </div>
                        ))}
                    </HorizontalScroll>
                ) : trendingBooks.length > 0 ? (
                    <HorizontalScroll>
                        {trendingBooks.map((book) => (
                            <div key={book.id} className="shrink-0 w-44">
                                <BookCard book={book} showPrices={false} />
                            </div>
                        ))}
                    </HorizontalScroll>
                ) : (
                    <div className="text-center py-8 text-white/30 text-sm">
                        Unable to load trending books right now.
                    </div>
                )}
            </section>

            {/* NYT BESTSELLERS */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400" />
                        <h2 className="text-xl font-display font-bold text-white">NYT Bestsellers</h2>
                    </div>
                    <button
                        onClick={() => router.push('/discover?q=new+york+times+bestseller+2024')}
                        className="text-sm text-amber-400 font-medium flex items-center gap-1 hover:text-amber-300 transition-colors"
                    >
                        See all <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {nytLoading ? (
                    <HorizontalScroll>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="shrink-0 w-44">
                                <BookCardSkeleton />
                            </div>
                        ))}
                    </HorizontalScroll>
                ) : nytBooks.length > 0 ? (
                    <HorizontalScroll>
                        {nytBooks.map((book) => (
                            <div key={book.id} className="shrink-0 w-44">
                                <BookCard book={book} showPrices={false} />
                            </div>
                        ))}
                    </HorizontalScroll>
                ) : (
                    <div className="text-center py-8 text-white/30 text-sm">
                        Unable to load bestsellers right now.
                    </div>
                )}
            </section>

            {/* MOOD-BASED DISCOVERY */}
            <section id="mood-section" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950 via-violet-900/50 to-surface p-8 md:p-10 text-white border border-violet-500/10">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="md:w-1/3 space-y-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold uppercase tracking-widest text-violet-300">
                                <Sparkles className="w-3 h-3 text-violet-400" />
                                AI Powered
                            </div>
                            <h2 className="text-2xl md:text-3xl font-display font-bold">How are you feeling?</h2>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Describe your mood, a setting, or your favorite tropes, and let our AI find the perfect book for you.
                            </p>
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={moodInput}
                                    onChange={(e) => setMoodInput(e.target.value)}
                                    placeholder="e.g. A dark academic thriller with a twist..."
                                    className="w-full p-4 pr-24 bg-white/[0.06] border border-white/[0.06] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all text-sm backdrop-blur-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && moodInput.trim()) {
                                            handleInlineMoodSearch();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleInlineMoodSearch}
                                    disabled={moodLoading}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-violet-500 text-white font-semibold rounded-lg hover:bg-violet-400 transition-all disabled:opacity-50 flex items-center justify-center text-sm"
                                >
                                    {moodLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {moodTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            setMoodInput(tag);
                                            router.push(`/discover?mood=${encodeURIComponent(tag)}`);
                                        }}
                                        className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/40 hover:text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/20 transition-all"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {moodResults.length > 0 && (
                        <div id="mood-results" className="mt-8 pt-6 border-t border-white/[0.06]">
                            {moodExplanation && (
                                <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/60 flex gap-2">
                                    <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                                    <p>{moodExplanation}</p>
                                </div>
                            )}
                            <HorizontalScroll>
                                {moodResults.map((book) => (
                                    <div key={book.id} className="shrink-0 w-44">
                                        <BookCard book={book} showPrices={false} />
                                    </div>
                                ))}
                            </HorizontalScroll>
                        </div>
                    )}
                </div>
            </section>

            {/* POPULAR FOLIOS */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <ListMusic className="w-5 h-5 text-amber-400" />
                        <h2 className="text-xl font-display font-bold text-white">Popular Folios</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {POPULAR_FOLIOS.map((folio) => (
                        <div
                            key={folio.id}
                            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all cursor-pointer group"
                        >
                            <div className="flex -space-x-4 mb-4">
                                {folio.coverImages.map((cover, i) => (
                                    <div
                                        key={i}
                                        className="relative w-16 h-24 rounded-lg overflow-hidden shadow-book border-2 border-surface"
                                        style={{ zIndex: folio.coverImages.length - i }}
                                    >
                                        <Image
                                            src={cover}
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                                <div className="flex items-center ml-2 pl-2">
                                    <span className="text-xs text-white/30 font-medium">+{folio.bookCount - 3} more</span>
                                </div>
                            </div>

                            <h3 className="text-base font-display font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
                                {folio.title}
                            </h3>
                            <p className="text-sm text-white/40 line-clamp-2 mb-3">{folio.description}</p>
                            <div className="flex items-center gap-2 text-xs text-white/30">
                                <User className="w-3 h-3" />
                                <span>Curated by {folio.curator}</span>
                                <span className="text-white/[0.06]">|</span>
                                <span>{folio.bookCount} books</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page wrapper with Suspense
// ---------------------------------------------------------------------------
export default function DiscoverPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-white/[0.06] border-t-amber-500 animate-spin" />
                    <p className="text-white/40 font-serif">Loading Discover...</p>
                </div>
            </div>
        }>
            <DiscoverContent />
        </Suspense>
    );
}
