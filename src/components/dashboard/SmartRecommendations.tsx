'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { searchBooks } from '@/lib/api/google-books';
import { Sparkles, Plus, RefreshCw, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { addToLibrary } from '@/lib/api/library';
import { toast } from 'sonner';

// Internal component for elegant cover handling
const BookCover = ({ title, author, url }: { title: string, author: string, url?: string }) => {
    const [error, setError] = useState(false);

    // Generate a consistent gradient based on title length/char code
    // This ensures the same book always gets the same color
    const getGradient = () => {
        const colors = [
            'from-purple-900 to-indigo-900',
            'from-blue-900 to-cyan-900',
            'from-emerald-900 to-teal-900',
            'from-red-900 to-rose-900',
            'from-amber-900 to-orange-900',
            'from-slate-800 to-zinc-900'
        ];
        // Simple hash
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    if (url && !error) {
        return (
            <Image
                src={url}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="140px"
                onError={() => setError(true)}
            />
        );
    }

    return (
        <div className={`w-full h-full bg-gradient-to-br ${getGradient()} p-4 flex flex-col justify-between text-white/90 group-hover:scale-105 transition-transform duration-500`}>
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] mix-blend-overlay"></div>

            <div className="relative space-y-2 z-10">
                <div className="w-6 h-6 rounded border border-white/20 flex items-center justify-center">
                    <BookOpen className="w-3 h-3 text-white/50" />
                </div>
                <h3 className="text-sm font-serif font-bold leading-tight line-clamp-4 tracking-wide">{title}</h3>
            </div>
            <div className="relative z-10 pt-2 border-t border-white/10 mt-2">
                <p className="text-[10px] font-medium uppercase tracking-widest opacity-75 line-clamp-1">
                    {author.split(' ')[0]} {author.split(' ').pop()}
                </p>
            </div>
        </div>
    );
};

export default function SmartRecommendations() {
    interface RecommendedBook {
        id: string;
        title: string;
        author: string;
        coverUrl?: string;
        reason?: string;
        ratingsCount?: number;
    }

    interface TopRatedBook {
        status: string;
        rating: number;
        book: {
            google_id: string;
            title: string;
            authors: string[];
        };
    }

    const [books, setBooks] = useState<RecommendedBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [recommendationReason, setRecommendationReason] = useState<{ type: 'genre' | 'book', value: string }>({ type: 'genre', value: 'Fiction' });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    /**
     * Strict validator to filter out low-quality metadata
     */
    const isValidBook = (book: any, existingIds: Set<string>, existingTitles: Set<string>): boolean => {
        if (!book.id || !book.title) return false;

        // Check 1: Deduplication
        if (existingIds.has(book.id)) return false;
        if (existingTitles.has(book.title.toLowerCase().trim())) return false;

        // Check 2: Filter out "Box Set" and "Collection" type entries which often have bad covers
        const badKeywords = ['box set', 'collection', 'bundle', 'complete series', ' 1-'];
        if (badKeywords.some(kw => book.title.toLowerCase().includes(kw))) return false;

        // Check 3: Description length? (Optional, maybe too strict)

        return true;
    };

    useEffect(() => {
        let isMounted = true;

        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const supabase = createClient();
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const { getTopRatedBooks } = await import('@/lib/api/library');
                const { getReadAlikes, getTasteBasedRecommendations } = await import('@/lib/api/gemini');

                const topBooks = await getTopRatedBooks(user.id) as unknown as TopRatedBook[];
                const { data: library } = await supabase.from('user_library').select('book:books(google_id, title)').eq('user_id', user.id);

                // Track IDs and Titles to prevent duplicates
                // Track IDs and Titles to prevent duplicates
                const libraryItems = library || [];
                const existingGoogleIds = new Set(libraryItems.map((item: { book: { google_id: string } | null }) => item.book?.google_id).filter((id): id is string => !!id));
                const existingTitles = new Set(libraryItems.map((item: { book: { title: string } | null }) => item.book?.title?.toLowerCase().trim()).filter((title): title is string => !!title));

                // Add top rated books to "seen" list so we don't recommend what they already love
                topBooks.forEach(tb => {
                    existingTitles.add(tb.book.title.toLowerCase().trim());
                    existingGoogleIds.add(tb.book.google_id);
                });

                // Filter for "Finished And Highly Rated" as per user request
                // We typically assume rated = finished, but let's be strict if status is available
                const finishedAndRated = topBooks.filter(t => t.status === 'completed' || t.rating >= 4);

                const usePersonalized = finishedAndRated.length > 0; // Always try personalization if we have data

                if (usePersonalized) {
                    let analysis = null;

                    // Priority 1: Holistic Taste Profile (if we have at least 1 book)
                    // Lowered threshold to 1 as per user request to see "similarities" immediately
                    if (finishedAndRated.length >= 1) {
                        const likedBooks = finishedAndRated.slice(0, 5).map(b => ({ title: b.book.title, author: b.book.authors[0] || 'Unknown' }));
                        const { data: profile } = await supabase.from('profiles').select('favorite_genres').eq('id', user.id).single();
                        const genres = profile?.favorite_genres || ['Fiction'];

                        analysis = await getTasteBasedRecommendations(likedBooks, genres);
                        if (isMounted) setRecommendationReason({ type: 'book', value: 'Your Reading History' });
                    }

                    // Priority 2: Single Book Read-Alike (fallback if global analysis fails)
                    if (!analysis) {
                        const seedBook = finishedAndRated[Math.floor(Math.random() * finishedAndRated.length)];
                        if (isMounted) setRecommendationReason({ type: 'book', value: seedBook.book.title });
                        analysis = await getReadAlikes(seedBook.book.title, seedBook.book.authors[0] || 'Unknown');
                    }

                    if (analysis) {
                        const hydatedBooks = [];
                        for (const rec of analysis.recommendations) {
                            // Skip if title already known
                            if (existingTitles.has(rec.title.toLowerCase().trim())) continue;

                            try {
                                // POPULARITY CHECK: Fetch top 3 results and pick the one with most ratings
                                const searchResults = await searchBooks(`intitle:${rec.title} inauthor:${rec.author}`, 3, 0, 'US');

                                // Sort by ratingsCount descending (if available), then by valid cover
                                const sorted = searchResults.sort((a: any, b: any) => (b.ratingsCount || 0) - (a.ratingsCount || 0));

                                // Default to first result if no ratings, but prefer rated ones
                                const bestMatch = sorted.find((b: any) => isValidBook(b, existingGoogleIds, existingTitles)) || sorted[0];

                                if (bestMatch && isValidBook(bestMatch, existingGoogleIds, existingTitles)) {
                                    hydatedBooks.push({ ...bestMatch, reason: rec.reason });
                                    existingGoogleIds.add(bestMatch.id);
                                    existingTitles.add(bestMatch.title.toLowerCase().trim());
                                }
                            } catch (e) {
                                console.warn('Failed to hydrate', rec.title);
                            }
                        }

                        if (isMounted && hydatedBooks.length > 0) {
                            setBooks(hydatedBooks);
                            setLoading(false);
                            return;
                        }
                    }

                    // Priority 3: Fallback 
                }

                // --- GENRE DISCOVERY ---
                const { data: profile } = await supabase.from('profiles').select('favorite_genres').eq('id', user.id).single();
                let searchGenre = 'Fiction';
                if (profile?.favorite_genres && profile.favorite_genres.length > 0) {
                    searchGenre = profile.favorite_genres[Math.floor(Math.random() * profile.favorite_genres.length)];
                }

                if (isMounted) setRecommendationReason({ type: 'genre', value: searchGenre });

                // Try a few random offsets to get fresh data
                const randomOffset = Math.floor(Math.random() * 60);
                const results = await searchBooks(`subject:${searchGenre}`, 30, randomOffset, 'US');

                const filtered = [];
                for (const b of results) {
                    if (isValidBook(b, existingGoogleIds, existingTitles)) {
                        filtered.push(b);
                        existingGoogleIds.add(b.id);
                        existingTitles.add(b.title.toLowerCase().trim());
                    }
                    if (filtered.length >= 8) break;
                }

                if (isMounted) {
                    setBooks(filtered);
                    setLoading(false);
                }
            } catch (error) {
                console.error('SmartRecommendations error:', error);
                if (isMounted) setLoading(false);
            }
        };

        fetchRecommendations();

        return () => {
            isMounted = false;
        };
    }, [refreshTrigger]);

    const handleAddBook = async (book: RecommendedBook) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setAddingId(book.id);
        try {
            await addToLibrary(user.id, book.id, 'wishlist');
            toast.success('Added to your wishlist');
            setBooks(prev => prev.filter(b => b.id !== book.id));
        } catch (error) {
            toast.error('Failed to add book');
        } finally {
            setAddingId(null);
        }
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-48 bg-card-border rounded" />
                    <div className="h-8 w-8 bg-card-border rounded-full" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="min-w-[140px] space-y-3">
                            <div className="aspect-[2/3] bg-card-border rounded-xl" />
                            <div className="h-4 w-3/4 bg-card-border rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -z-10" />
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary-500/20 border border-primary-500/30">
                            <Sparkles className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Recommended For You</h2>
                            <p className="text-xs text-muted-foreground">
                                {recommendationReason.type === 'book' ? (
                                    <>Because you liked <span className="text-primary-400 font-medium italic">{recommendationReason.value}</span></>
                                ) : (
                                    <>Based on your taste in <span className="text-primary-400 font-medium">{recommendationReason.value}</span></>
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-2 rounded-full hover:bg-elevated text-muted-foreground hover:text-foreground transition-colors"
                        title="Refresh Recommendations"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="h-48 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-card-border rounded-xl">
                    <p className="text-muted-foreground mb-4">No new recommendations found right now.</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 rounded-lg text-sm font-medium transition-colors"
                    >
                        Try Refreshing
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary-500/20 border border-primary-500/30">
                        <Sparkles className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Recommended For You</h2>
                        <p className="text-xs text-muted-foreground">
                            {recommendationReason.type === 'book' ? (
                                <>Because you liked <span className="text-primary-400 font-medium italic">{recommendationReason.value}</span></>
                            ) : (
                                <>Based on your taste in <span className="text-primary-400 font-medium">{recommendationReason.value}</span></>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Refresh Recommendations"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#1e2749] scrollbar-track-transparent">
                {books.map((book) => (
                    <div key={book.id} className="snap-start flex-shrink-0 w-[140px] group flex flex-col">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-card-border group-hover:border-primary-500/50 transition-all duration-300 group-hover:-translate-y-1 mb-3 bg-card-border">
                            <BookCover title={book.title} author={book.author} url={book.coverUrl} />

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                                <button
                                    onClick={() => handleAddBook(book)}
                                    disabled={addingId === book.id}
                                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                                    title="Add to Wishlist"
                                >
                                    {addingId === book.id ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary-400 transition-colors" title={book.title}>
                            {book.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">by {book.author}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
