import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ExternalLink, BookOpen, MoreVertical, Check, ChevronDown, Library, Clock, CheckCircle, Trash2 } from 'lucide-react';
import type { BookWithPrices } from '@/types';
import { getBestPrice } from '@/lib/api/prices';
import { type ReadingStatus } from '@/lib/api/library';
import { useCurrency } from '@/contexts/CurrencyContext';

interface BookCardProps {
    book: BookWithPrices;
    onWishlistToggle?: (bookId: string) => void;
    isInWishlist?: boolean;
    showPrices?: boolean;
    onStatusChange?: (status: ReadingStatus) => void;
    onRemove?: (bookId: string) => void;
    readingStatus?: ReadingStatus;
    progress?: number;
    userRating?: number;
    onProgressUpdate?: (page: number) => void;
}

import AddToCollectionModal from '@/components/collections/AddToCollectionModal';
import SeriesBadge from '@/components/SeriesBadge';
import SeriesEditModal from '@/components/SeriesEditModal';
import { Plus, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ADMIN_EMAILS } from '@/lib/constants';
import { useEffect } from 'react';

export default function BookCard({
    book,
    onWishlistToggle,
    isInWishlist = false,
    showPrices = true,
    onStatusChange,
    onRemove,
    readingStatus,
    progress,
    userRating,
    onProgressUpdate,
    userSeriesName,
    userSeriesOrder
}: BookCardProps & { userSeriesName?: string | null, userSeriesOrder?: number | null }) {
    const [showMenu, setShowMenu] = useState(false);
    const [showAddToCollection, setShowAddToCollection] = useState(false);
    const [showSeriesEdit, setShowSeriesEdit] = useState(false);
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    const [tempPage, setTempPage] = useState(progress || 0);
    const { symbol, currency } = useCurrency();
    const bestDeal = showPrices && book.prices.length > 0 ? getBestPrice(book.prices, currency) : null;
    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (readingStatus) {
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user?.email && ADMIN_EMAILS.includes(user.email)) {
                    setIsAdmin(true);
                }
            });
        }
    }, [readingStatus, supabase]);

    // ... imports and setup

    // ... existing code ...

    return (
        <div className="group relative flex flex-col w-full rounded-[24px] bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-white/10 shadow-md hover:shadow-lg dark:shadow-none transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            {/* Cover Image & Link */}
            <Link href={`/book/${book.id}`} className="relative aspect-[2/3] w-full block overflow-hidden bg-muted">
                {book.coverUrl ? (
                    <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <BookOpen className="w-12 h-12" />
                    </div>
                )}

                {/* Gradient Overlay - Subtle */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Status/Progress Bar */}
                {readingStatus === 'reading' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40 backdrop-blur-sm">
                        <div
                            className="h-full bg-primary-500 dark:bg-accent-500 transition-all duration-300 shadow-[0_0_10px_rgba(224,122,95,0.5)] dark:shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Percentage Badge */}
                {readingStatus === 'reading' && progress !== undefined && progress > 0 && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
                        <span className="text-[11px] font-bold text-white tabular-nums tracking-wide">{Math.round(progress)}%</span>
                    </div>
                )}

                {/* Status Dropdown */}
                {readingStatus && (
                    <div className="absolute top-2 right-2 z-50">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-2xl flex items-center gap-1 transition-all duration-300 ${showMenu
                                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-transparent'
                                : 'bg-white/90 dark:bg-black/60 text-slate-700 dark:text-slate-200 border-transparent hover:bg-white dark:hover:bg-black/80'
                                }`}
                        >
                            {readingStatus === 'reading' && 'Reading'}
                            {readingStatus === 'completed' && 'Finished'}
                            {readingStatus === 'wishlist' && 'Want toRead'}
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowMenu(false);
                                    }}
                                />
                                <div className="absolute right-0 top-full mt-2 w-40 bg-white/95 dark:bg-[#1E1B29]/95 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col p-1.5 animate-in zoom-in-95 fade-in-0 duration-200 origin-top-right">
                                    {(['reading', 'wishlist', 'completed'] as ReadingStatus[]).map((status) => (
                                        <button
                                            key={status}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onStatusChange?.(status);
                                                setShowMenu(false);
                                            }}
                                            className={`px-3 py-2.5 text-left text-xs font-semibold rounded-xl flex items-center justify-between transition-all duration-200 ${readingStatus === status
                                                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <span className="capitalize">
                                                {status === 'wishlist' ? 'Want to Read' : status}
                                            </span>
                                            {readingStatus === status && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}
                                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1 mx-2" />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onRemove?.(book.id);
                                            setShowMenu(false);
                                        }}
                                        className="px-3 py-2.5 text-left text-xs font-semibold rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Remove
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Link>

            {/* Action Buttons Overlay (Top Left) */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAddToCollection(true);
                    }}
                    className="p-2.5 rounded-full bg-white/90 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 text-slate-700 dark:text-white backdrop-blur-md transition-all shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0"
                    title="Add to Shelf"
                >
                    <Library className="w-4 h-4" />
                </button>
            </div>

            {/* ... inside Content Section ... */}

            {/* Content Section */}
            <div className="flex flex-col p-4 pt-3 bg-white dark:bg-[#1A1F2E] flex-1">
                {/* Series Badge & Edit */}
                <div className="mb-1.5 flex items-center gap-2 pointer-events-auto min-h-[18px]">
                    <SeriesBadge
                        seriesName={userSeriesName || book.seriesName}
                        seriesOrder={userSeriesOrder || book.seriesOrder}
                    />
                    {readingStatus && isAdmin && ( // Only show edit if in library AND admin
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowSeriesEdit(true);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-500 transition-all rounded-full hover:bg-primary-500/10"
                            title="Edit Series Info"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Categories - Hidden on card to save space, or kept minimal */}

                {/* Title & Author */}
                <div className="mb-2">
                    <Link href={`/book/${book.id}`} className="block pointer-events-auto">
                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-0.5 font-display tracking-tight">
                            {book.title}
                        </h3>
                    </Link>
                    <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium truncate">
                        {book.authors?.join(', ') || 'Unknown Author'}
                    </p>
                </div>

                {/* Spacer to push actions to bottom not needed with tight layout, just render rating */}
                <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/5 relative">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        {userRating ? (
                            <>
                                <span className="text-yellow-500">★</span> {userRating}/5
                            </>
                        ) : book.rating ? (
                            <>⭐ {book.rating}/5</>
                        ) : 'Not rated'}
                    </span>

                    {/* Compare Button if no status options available, or just as secondary */}
                    {!readingStatus && (
                        <button className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-primary-500 hover:text-white text-slate-500 dark:text-slate-400 text-[10px] font-bold transition-all flex items-center gap-1 group/btn pointer-events-auto z-20">
                            Compare
                            <ExternalLink className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Add To Collection Modal */}
            <AddToCollectionModal
                isOpen={showAddToCollection}
                onClose={() => setShowAddToCollection(false)}
                bookId={book.id}
            />

            {/* Series Edit Modal */}
            {readingStatus && ( // Only render if in library (implies we have an ID that user_library recognizes)
                <SeriesEditModal
                    isOpen={showSeriesEdit}
                    onClose={() => setShowSeriesEdit(false)}
                    bookId={book.id}
                    currentSeriesName={userSeriesName || book.seriesName}
                    currentSeriesOrder={userSeriesOrder || book.seriesOrder}
                    onSave={() => window.location.reload()}
                />
            )}
        </div>
    );
}

// Loading skeleton for BookCard
export function BookCardSkeleton() {
    return (
        <div className="flex flex-col h-full rounded-2xl bg-[#141b3d]/60 border border-card-border overflow-hidden">
            <div className="w-full aspect-[2/3] bg-elevated shimmer animate-pulse" />
            <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="flex gap-2">
                    <div className="h-5 w-16 bg-[#1e2749] rounded shimmer animate-pulse" />
                    <div className="h-5 w-20 bg-[#1e2749] rounded shimmer animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-[#1e2749] rounded shimmer animate-pulse" />
                    <div className="h-4 w-1/2 bg-[#1e2749] rounded shimmer animate-pulse" />
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-card-border">
                    <div className="h-4 w-16 bg-[#1e2749] rounded shimmer animate-pulse" />
                    <div className="h-9 w-28 bg-[#1e2749] rounded-xl shimmer animate-pulse" />
                </div>
            </div>
        </div>
    );
}
