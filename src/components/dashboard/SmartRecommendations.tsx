'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { searchBooks } from '@/lib/api/google-books';
import { Sparkles, Plus, Check } from 'lucide-react';
import Image from 'next/image';
import { addToLibrary } from '@/lib/api/library';
import { toast } from 'sonner';

export default function SmartRecommendations() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [genre, setGenre] = useState<string>('Fiction');

    useEffect(() => {
        const fetchRecommendations = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get User Profile for Genres
            const { data: profile } = await supabase
                .from('profiles')
                .select('favorite_genres')
                .eq('id', user.id)
                .single();

            // 2. Get User Library to filter out existing books
            const { data: library } = await supabase
                .from('user_library')
                .select('book:books(google_id)')
                .eq('user_id', user.id);

            const existingGoogleIds = new Set(library?.map((item: any) => item.book?.google_id).filter(Boolean));

            // 3. Determine Genre
            let searchGenre = 'Fiction';
            if (profile?.favorite_genres && profile.favorite_genres.length > 0) {
                // Pick random genre to keep it fresh
                searchGenre = profile.favorite_genres[Math.floor(Math.random() * profile.favorite_genres.length)];
            }
            setGenre(searchGenre);

            // 4. Fetch from Google Books
            const results = await searchBooks(`subject:${searchGenre}`, 20);

            // 5. Filter and set
            const filtered = results.filter(b => !existingGoogleIds.has(b.id)).slice(0, 8);
            setBooks(filtered);
            setLoading(false);
        };

        fetchRecommendations();
    }, []);

    const handleAddBook = async (book: any) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setAddingId(book.id);
        try {
            await addToLibrary(user.id, book.id, 'wishlist');
            toast.success('Added to your wishlist');
            // Remove from list or show check? Show check is better.
        } catch (error) {
            toast.error('Failed to add book');
        } finally {
            setAddingId(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6 animate-pulse">
                <div className="h-6 w-48 bg-[#1e2749] rounded mb-6" />
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="min-w-[140px] space-y-3">
                            <div className="aspect-[2/3] bg-[#1e2749] rounded-xl" />
                            <div className="h-4 w-3/4 bg-[#1e2749] rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (books.length === 0) return null;

    return (
        <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary-500/20 border border-primary-500/30">
                        <Sparkles className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Recommended For You</h2>
                        <p className="text-xs text-slate-400">Based on your taste in <span className="text-primary-400 font-medium">{genre}</span></p>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#1e2749] scrollbar-track-transparent">
                {books.map((book) => (
                    <div key={book.id} className="snap-start flex-shrink-0 w-[140px] group flex flex-col">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-[#1e2749] group-hover:border-primary-500/50 transition-all duration-300 group-hover:-translate-y-1 mb-3">
                            {book.coverUrl ? (
                                <Image
                                    src={book.coverUrl}
                                    alt={book.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="140px"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs text-center p-2 text-slate-500">
                                    No Cover
                                </div>
                            )}

                            {/* Overlay Action */}
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

                        <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight mb-1 group-hover:text-primary-400 transition-colors" title={book.title}>
                            {book.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">by {book.author}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
