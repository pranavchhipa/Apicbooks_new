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
    onProgressUpdate
}: BookCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    const [tempPage, setTempPage] = useState(progress || 0);
    const { symbol, currency } = useCurrency();
    const bestDeal = showPrices && book.prices.length > 0 ? getBestPrice(book.prices, currency) : null;

    const SHELF_OPTIONS: { label: string, value: ReadingStatus, color: string }[] = [
        { label: 'Want to Read', value: 'wishlist', color: 'text-rose-400' },
        { label: 'Reading', value: 'reading', color: 'text-primary-400' },
        { label: 'Finished', value: 'completed', color: 'text-emerald-400' },
    ];

    const handlePageUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onProgressUpdate) {
            onProgressUpdate(tempPage);
        }
        setIsUpdatingProgress(false);
    };

    return (
        <div className="group relative flex flex-col h-full rounded-2xl bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] overflow-hidden hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 hover:-translate-y-1 w-full">
            {/* Clickable Overlay */}
            <Link href={`/book/${book.id}`} className="absolute inset-0 z-20" />

            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Book Cover Container */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#0a0e27]">
                {book.coverUrl ? (
                    <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                        <BookOpen className="w-12 h-12 mb-3 text-primary-400 opacity-50" />
                        <span className="text-sm font-medium line-clamp-3 text-slate-400 leading-relaxed">
                            {book.title}
                        </span>
                        <span className="text-xs mt-2 text-slate-500">No Cover Available</span>
                    </div>
                )}

                {/* Wishlist Button (Floating) */}
                {onWishlistToggle && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onWishlistToggle(book.id);
                        }}
                        className={`
                            absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-30
                            ${isInWishlist
                                ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30'
                                : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'
                            }
                        `}
                    >
                        <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                    </button>
                )}

                {/* Status Badge (if provided) - Enhanced with colors and icons */}
                {readingStatus && (
                    <div className={`
                        absolute top-3 left-3 px-2.5 py-1.5 rounded-lg backdrop-blur-md border shadow-lg pointer-events-none z-20 flex items-center gap-1.5
                        ${readingStatus === 'wishlist'
                            ? 'bg-rose-500/80 border-rose-400/30 text-white'
                            : readingStatus === 'reading'
                                ? 'bg-primary-500/80 border-primary-400/30 text-white'
                                : 'bg-emerald-500/80 border-emerald-400/30 text-white'}
                    `}>
                        {readingStatus === 'wishlist' && <Heart className="w-3 h-3" />}
                        {readingStatus === 'reading' && <Clock className="w-3 h-3" />}
                        {readingStatus === 'completed' && <CheckCircle className="w-3 h-3" />}
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {readingStatus === 'wishlist' ? 'Want to Read' : readingStatus === 'reading' ? 'Reading' : 'Finished'}
                        </span>
                    </div>
                )}

                {/* Progress Bar with Percentage (if active) */}
                {progress !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 z-20">
                        {/* Percentage Badge */}
                        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-lg group-hover:hidden transition-all">
                            <span className="text-sm font-bold text-white">{progress}%</span>
                        </div>

                        {/* Manual Progress Update (Visible on Hover for Reading) */}
                        {readingStatus === 'reading' && onProgressUpdate && (
                            <div className="absolute bottom-3 right-3 hidden group-hover:flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/20 p-1.5 rounded-lg animate-in slide-in-from-bottom-2 fade-in duration-200">
                                {isUpdatingProgress ? (
                                    <form onSubmit={handlePageUpdate} className="flex items-center gap-1.5 z-40">
                                        <input
                                            type="number"
                                            value={tempPage}
                                            onChange={(e) => setTempPage(parseInt(e.target.value) || 0)}
                                            onClick={(e) => e.preventDefault()}
                                            className="w-16 bg-white/10 border border-white/20 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-primary-500"
                                            placeholder="Page"
                                            autoFocus
                                            min={0}
                                        />
                                        <button
                                            type="submit"
                                            className="p-1 rounded bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                                        >
                                            <Check className="w-3 h-3" />
                                        </button>
                                    </form>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setTempPage(book.pageCount ? Math.round((progress / 100) * book.pageCount) : 0); // Estimate page if we only have %
                                            setIsUpdatingProgress(true);
                                        }}
                                        className="text-xs font-bold text-white px-2 hover:text-primary-400 transition-colors flex items-center gap-1 z-30"
                                    >
                                        Update Page
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Progress Bar */}
                        <div className="h-1.5 bg-black/60 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Price Badge (Bottom Left) */}
                {bestDeal && (
                    <div className="absolute bottom-3 left-3 bg-[#0a0e27]/80 backdrop-blur-md border border-success-500/30 px-2.5 py-1 rounded-lg flex flex-col items-start shadow-lg pointer-events-none z-20">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-none mb-0.5">Best Deal</span>
                        <span className="text-sm font-bold text-success-400 leading-none">{symbol}{bestDeal.price.toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col p-4 pointer-events-none">
                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {book.categories?.slice(0, 2).map((cat, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-[#1e2749] text-[10px] font-medium text-slate-400 border border-[#1e2749] uppercase tracking-wide">
                            {cat}
                        </span>
                    ))}
                </div>

                {/* Title & Author */}
                <div className="mb-3">
                    <h3 className="text-base font-bold text-white leading-tight group-hover:text-primary-400 transition-colors line-clamp-2 mb-1">
                        {book.title}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium truncate">
                        {book.authors?.join(', ') || 'Unknown Author'}
                    </p>
                </div>

                {/* Spacer to push actions to bottom */}
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#1e2749] relative">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        {userRating ? (
                            <>
                                <span className="text-yellow-500">★</span> {userRating}/5
                            </>
                        ) : book.rating ? (
                            <>⭐ {book.rating}/5</>
                        ) : 'Not rated'}
                    </span>

                    <div className="flex items-center gap-2 pointer-events-auto z-30">
                        {/* Edit Status Dropdown - Only show if onStatusChange is provided */}
                        {onStatusChange ? (
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation(); // Prevent card click
                                        setShowMenu(!showMenu);
                                    }}
                                    onBlur={() => setTimeout(() => setShowMenu(false), 200)}
                                    className={`
                                        px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1
                                        ${showMenu
                                            ? 'bg-primary-500 text-white border-primary-500'
                                            : 'bg-[#1e2749] text-slate-300 border-[#1e2749] hover:border-primary-500/50 hover:text-white'
                                        }
                                    `}
                                >
                                    {readingStatus === 'wishlist' ? 'Want List' : readingStatus === 'reading' ? 'Reading' : readingStatus === 'completed' ? 'Finished' : 'Move'}
                                    <ChevronDown className="w-3 h-3" />
                                </button>

                                {/* Dropdown Menu */}
                                {showMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 w-36 bg-[#0a0e27] border border-[#1e2749] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-1">
                                            {SHELF_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onStatusChange(option.value);
                                                        setShowMenu(false);
                                                    }}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors text-left
                                                        ${readingStatus === option.value
                                                            ? 'bg-primary-500/10 text-white'
                                                            : 'text-slate-400 hover:bg-[#1e2749] hover:text-slate-200'
                                                        }
                                                    `}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${option.color.replace('text-', 'bg-')}`} />
                                                    {option.label}
                                                    {readingStatus === option.value && <Check className="w-3 h-3 ml-auto text-primary-400" />}
                                                </button>
                                            ))}

                                            {onRemove && (
                                                <div className="mt-1 pt-1 border-t border-[#1e2749]">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (confirm('Are you sure you want to remove this book from your library?')) {
                                                                onRemove(book.id);
                                                            }
                                                            setShowMenu(false);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Fallback to Compare button if no status editing
                            <button className="px-3 py-1.5 rounded-lg bg-[#1e2749] hover:bg-gradient-to-r hover:from-primary-500 hover:to-primary-600 text-slate-300 hover:text-white text-[10px] font-bold transition-all border border-[#1e2749] hover:border-primary-500/50 flex items-center gap-1 group/btn">
                                Compare
                                <ExternalLink className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Loading skeleton for BookCard
export function BookCardSkeleton() {
    return (
        <div className="flex flex-col h-full rounded-2xl bg-[#141b3d]/60 border border-[#1e2749] overflow-hidden">
            <div className="w-full aspect-[2/3] bg-[#1e2749] shimmer animate-pulse" />
            <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="flex gap-2">
                    <div className="h-5 w-16 bg-[#1e2749] rounded shimmer animate-pulse" />
                    <div className="h-5 w-20 bg-[#1e2749] rounded shimmer animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-[#1e2749] rounded shimmer animate-pulse" />
                    <div className="h-4 w-1/2 bg-[#1e2749] rounded shimmer animate-pulse" />
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#1e2749]">
                    <div className="h-4 w-16 bg-[#1e2749] rounded shimmer animate-pulse" />
                    <div className="h-9 w-28 bg-[#1e2749] rounded-xl shimmer animate-pulse" />
                </div>
            </div>
        </div>
    );
}
