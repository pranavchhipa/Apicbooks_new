
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getNYTBestSellers, BestSellerBook } from '@/lib/api/nyt';
import { TrendingUp, ExternalLink, RefreshCw } from 'lucide-react';

export default function BestSellersList() {
    const [books, setBooks] = useState<BestSellerBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasKey, setHasKey] = useState(true);

    useEffect(() => {
        async function fetchBestSellers() {
            try {
                // Determine if key is configured (client-side check for UX)
                if (!process.env.NEXT_PUBLIC_NYT_API_KEY) {
                    setHasKey(false);
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                const data = await getNYTBestSellers();
                setBooks(data.slice(0, 8)); // Top 8
            } catch (error) {
                console.error('Failed to load best sellers', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBestSellers();
    }, []);

    if (!hasKey) {
        return (
            <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-accent-400" />
                    <h2 className="text-xl font-bold text-foreground">Trending Now</h2>
                </div>
                <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm mb-2">NYT API Key Not Configured</p>
                    <p className="text-xs text-slate-500">Add NEXT_PUBLIC_NYT_API_KEY to .env.local to see real-time Best Sellers.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-accent-500/20 border border-accent-500/30">
                        <TrendingUp className="w-5 h-5 text-accent-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">NYT Best Sellers</h2>
                        <p className="text-xs text-muted-foreground">Top Fiction This Week</p>
                    </div>
                </div>
                <a
                    href="https://www.nytimes.com/books/best-sellers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-elevated hover:bg-primary-500/20 text-white/80 hover:text-foreground transition-all flex items-center gap-1"
                >
                    View All <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            {isLoading ? (
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="min-w-[140px] space-y-3">
                            <div className="aspect-[2/3] bg-card-border rounded-xl animate-pulse" />
                            <div className="h-4 w-3/4 bg-card-border rounded animate-pulse" />
                            <div className="h-3 w-1/2 bg-card-border rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#1e2749] scrollbar-track-transparent hover:scrollbar-thumb-primary-500/30">
                    {books.map((book) => (
                        <div key={book.primary_isbn13} className="snap-start flex-shrink-0 w-[140px] group flex flex-col">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-card-border group-hover:border-primary-500/50 transition-all duration-300 group-hover:-translate-y-1 mb-3">
                                <Image
                                    src={book.book_image}
                                    alt={book.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="140px"
                                />
                                <div className="absolute top-2 left-2 w-8 h-8 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
                                    <span className="text-lg font-bold text-foreground">#{book.rank}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <a
                                        href={book.amazon_product_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-1.5 bg-white text-black text-xs font-bold rounded-lg text-center hover:bg-primary-50 transition-colors"
                                    >
                                        Buy Now
                                    </a>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary-400 transition-colors" title={book.title}>
                                {book.title}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate mb-1">by {book.author}</p>
                            <span className="text-[10px] text-slate-500 bg-elevated/50 px-2 py-0.5 rounded-full w-fit">
                                {book.weeks_on_list} wks on list
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
