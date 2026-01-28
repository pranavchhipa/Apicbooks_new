'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, FileText, Heart, Tag, Users, Share2, Twitter, Facebook, Copy, Check, ExternalLink, Loader2, ChevronDown, CheckCircle, Globe, Lock, ShoppingCart } from 'lucide-react';
import PriceTable from '@/components/PriceTable';
import StarRating from '@/components/StarRating';
import CommunityReviews from '@/components/CommunityReviews';
import type { BookWithPrices } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { addToLibrary, getBookStatus, updateLibraryProgress, ReadingStatus } from '@/lib/api/library';
import { toast } from 'sonner';

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookId = params.id as string;

    const [book, setBook] = useState<BookWithPrices | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // Shelving State
    const [shelfStatus, setShelfStatus] = useState<ReadingStatus | null>(null);
    const [isShelving, setIsShelving] = useState(false);
    const [showShelfMenu, setShowShelfMenu] = useState(false);
    // Review State
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSavingReview, setIsSavingReview] = useState(false);

    // Progress State
    const [currentPage, setCurrentPage] = useState(0);
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    const [isReviewPublic, setIsReviewPublic] = useState(true);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [internalBookId, setInternalBookId] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        async function fetchBookAndStatus() {
            setIsLoading(true);
            setError(null);
            console.log('[BookDetail] Fetching book:', bookId);

            try {
                // 1. Fetch Book Details from Google API (via our route)
                const response = await fetch(`/api/book/${bookId}`);
                const data = await response.json();

                if (data.success && data.data?.book) {
                    setBook(data.data.book);
                    console.log('[BookDetail] Google Book loaded:', data.data.book.title);

                    // 2. Resolve Internal UUID
                    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(bookId);
                    let targetUuid: string | null = null;

                    if (isUuid) {
                        console.log('[BookDetail] ID is UUID, using directly');
                        targetUuid = bookId;
                    } else {
                        const { data: internalBook, error: internalErr } = await supabase
                            .from('books')
                            .select('id')
                            .eq('google_id', bookId)
                            .single();

                        if (internalErr && internalErr.code !== 'PGRST116') {
                            console.error('[BookDetail] Error finding internal book:', internalErr);
                        }
                        targetUuid = internalBook?.id || null;
                    }

                    console.log('[BookDetail] Target Internal UUID:', targetUuid || 'Not found');

                    if (targetUuid) {
                        setInternalBookId(targetUuid);

                        // 3. Fetch User Status (if logged in)
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                            console.log('[BookDetail] Fetching user status for:', user.id);
                            const { data: entry, error: entryErr } = await supabase
                                .from('user_library')
                                .select('status, rating, review, current_page, is_review_public')
                                .eq('user_id', user.id)
                                .eq('book_id', targetUuid) // Use UUID (targetUuid)
                                .single();

                            console.log('[BookDetail] Library entry:', entry, 'Error:', entryErr);

                            if (entry) {
                                setShelfStatus(entry.status);
                                setRating(entry.rating || 0);
                                setReviewText(entry.review || '');
                                setCurrentPage(entry.current_page || 0);
                                setIsReviewPublic(entry.is_review_public !== false);
                            }
                            setUserId(user.id);
                        }
                    }
                } else {
                    setError(data.error || 'Book not found');
                }
            } catch (err) {
                console.error('[BookDetail] Fatal error:', err);
                setError('Failed to load book details');
            } finally {
                setIsLoading(false);
            }
        }

        if (bookId) {
            fetchBookAndStatus();
        }
    }, [bookId]);

    const handleShelfUpdate = async (newStatus: ReadingStatus) => {
        if (!book) return;
        setIsShelving(true);
        setShowShelfMenu(false);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please log in to save books!");
                return;
            }

            // addToLibrary returns the library item, which contains the internal book_id
            const item = await addToLibrary(user.id, bookId, newStatus);
            if (item && item.book_id) {
                setInternalBookId(item.book_id);
            }

            setShelfStatus(newStatus);
            const statusLabel = newStatus === 'wishlist' ? 'Want to Read' : newStatus === 'reading' ? 'Reading' : 'Finished';
            toast.success(`Marked as ${statusLabel}`);
        } catch (e) {
            console.error(e);
            toast.error("Failed to update shelf");
        } finally {
            setIsShelving(false);
        }
    };

    const handleProgressUpdate = async () => {
        if (!book) return;
        setIsUpdatingProgress(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Ensure we have an internal ID (though if we are tracking progress, we should)
            let currentUUID = internalBookId;
            if (!currentUUID) {
                const item = await addToLibrary(user.id, bookId, shelfStatus || 'reading');
                currentUUID = item.book_id;
                setInternalBookId(currentUUID);
            }

            await updateLibraryProgress(user.id, currentUUID!, currentPage);

            // Auto-complete if finished
            if (book.pageCount && currentPage >= book.pageCount && shelfStatus === 'reading') {
                await handleShelfUpdate('completed');
                toast.success("Congratulations on finishing the book!");
            } else {
                toast.success("Progress updated!");
            }

        } catch (e) {
            console.error(e);
            toast.error("Failed to update progress");
        } finally {
            setIsUpdatingProgress(false);
        }
    };

    const [lastReviewUpdate, setLastReviewUpdate] = useState(0);

    // ...

    const handleSaveReview = async () => {
        setIsSavingReview(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Ensure book is cached and gets UUID
            let targetUUID = internalBookId;

            if (!targetUUID) {
                // If fetching failed or book not in DB yet, create it via addToLibrary
                // We'll set status to 'completed' as default for reviewing
                try {
                    const item = await addToLibrary(user.id, bookId, shelfStatus || 'completed');
                    targetUUID = item.book_id;
                    setInternalBookId(targetUUID);
                    if (!shelfStatus) setShelfStatus('completed');
                } catch (err) {
                    console.error("Failed to cache book for review:", err);
                    throw new Error("Could not initialize book entry");
                }
            }

            console.log("[handleSaveReview] Submitting review:", {
                targetUUID,
                rating,
                reviewText,
                isReviewPublic
            });

            if (!reviewText.trim()) {
                console.warn("[handleSaveReview] Warning: Review text is empty!");
            }

            const payload = {
                user_id: user.id,
                book_id: targetUUID!,
                rating: rating,
                review: reviewText,
                status: shelfStatus || 'completed',
                is_review_public: isReviewPublic
            };

            const { error: upsertError } = await supabase
                .from('user_library')
                .upsert(payload, { onConflict: 'user_id,book_id' });

            if (upsertError) {
                console.error("[handleSaveReview] Upsert error:", upsertError);
                throw upsertError;
            }

            toast.success("Review saved!");

            // Log activity for Pulse feed
            if (isReviewPublic && book) {
                // Dynamic import to avoid circular dependency issues if any
                const { logActivity } = await import('@/components/ActivityFeed');
                await logActivity(
                    user.id,
                    'reviewed',
                    targetUUID!,
                    book.title,
                    book.coverUrl || undefined,
                    {
                        rating: rating,
                        review_snippet: reviewText.substring(0, 150) + (reviewText.length > 150 ? '...' : ''), // Store snippet
                        description: reviewText // Store full text optionally
                    }
                );
            }

            setLastReviewUpdate(Date.now()); // Trigger refresh of community reviews
        } catch (e) {
            toast.error("Failed to save review");
            console.error(e);
        } finally {
            setIsSavingReview(false);
        }
    };

    const handleShare = async (platform: string) => {
        const url = window.location.href;
        const text = book ? `Check out "${book.title}" on ApicBooks!` : 'Check out this book on ApicBooks!';

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                await navigator.clipboard.writeText(url);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
                break;
        }
    };

    const SHELF_OPTIONS: { label: string, value: ReadingStatus, color: string }[] = [
        { label: 'Want to Read', value: 'wishlist', color: 'text-rose-400' },
        { label: 'Reading', value: 'reading', color: 'text-primary-400' },
        { label: 'Finished', value: 'completed', color: 'text-emerald-400' },
    ];

    const currentShelfOption = SHELF_OPTIONS.find(o => o.value === shelfStatus);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                    <p className="text-slate-400">Loading book details...</p>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl text-center py-12 px-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-2">Book Not Found</h2>
                    <p className="text-slate-400 mb-6">{error || 'The book you are looking for does not exist.'}</p>
                    <Link href="/discover" className="btn-gradient inline-block">
                        Back to Discover
                    </Link>
                </div>
            </div>
        );
    }

    const readingTime = book.pageCount ? Math.round(book.pageCount / 40) : null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
            {/* Back Button */}
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Book Cover */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#141b3d] border border-[#1e2749] group shadow-xl">
                            {book.coverUrl ? (
                                <Image
                                    src={book.coverUrl}
                                    alt={book.title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                                    <BookOpen className="w-24 h-24 text-primary-400/50" />
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {/* Read Online Button - Open Library */}
                            {book.readLink && (
                                <a
                                    href={book.readLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold btn-primary shadow-lg shadow-primary-500/20 group"
                                >
                                    <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Read Online
                                </a>
                            )}

                            {/* Audiobook Button - LibriVox */}
                            {book.audiobookUrl && (
                                <a
                                    href={book.audiobookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-300 group"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-400 blur-sm opacity-50 animate-pulse"></div>
                                        <Users className="w-5 h-5 relative z-10" />
                                    </div>
                                    Listen Free {book.audiobookDuration && `(${book.audiobookDuration})`}
                                </a>
                            )}

                            {/* Shelving Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowShelfMenu(!showShelfMenu)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all duration-300 border ${currentShelfOption
                                        ? 'bg-[#1e2749] border-primary-500 text-white'
                                        : 'btn-secondary text-slate-300'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {isShelving ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
                                        {currentShelfOption ? currentShelfOption.label : 'Add to My Books'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showShelfMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {showShelfMenu && (
                                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#0a0e27] border border-[#1e2749] rounded-xl shadow-2xl z-50 animate-fade-in-up">
                                        {SHELF_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleShelfUpdate(option.value)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#1e2749] transition-colors text-left group ${shelfStatus === option.value ? 'bg-primary-500/10' : ''
                                                    }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${option.color.replace('text-', 'bg-')}`} />
                                                <span className={`flex-1 font-medium ${shelfStatus === option.value ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                    {option.label}
                                                </span>
                                                {shelfStatus === option.value && <CheckCircle className="w-4 h-4 text-primary-400" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Reading Progress Widget */}
                        {shelfStatus === 'reading' && (
                            <div className="bg-[#1e2749]/50 border border-[#1e2749] rounded-xl p-4 mb-4 animate-fade-in-up">
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                                    <span>Reading Progress</span>
                                    <span className="text-xs text-primary-400">
                                        {Math.round((currentPage / (book.pageCount || 1)) * 100)}%
                                    </span>
                                </h3>

                                {/* Progress Bar */}
                                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden mb-4">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                                        style={{ width: `${Math.min(100, (currentPage / (book.pageCount || 1)) * 100)}%` }}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(Math.min(Number(e.target.value), book.pageCount || 10000))}
                                            className="w-full bg-[#0a0e27] border border-[#1e2749] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                                            placeholder="Page"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-slate-500">
                                            / {book.pageCount || '?'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleProgressUpdate}
                                        disabled={isUpdatingProgress}
                                        className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isUpdatingProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Share Buttons */}
                        <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Share2 className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-400">Share this book</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="flex-1 p-3 rounded-xl bg-[#1e2749] hover:bg-[#1DA1F2]/20 text-slate-400 hover:text-[#1DA1F2] transition-colors"
                                    aria-label="Share on Twitter"
                                >
                                    <Twitter className="w-5 h-5 mx-auto" />
                                </button>
                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="flex-1 p-3 rounded-xl bg-[#1e2749] hover:bg-[#1877F2]/20 text-slate-400 hover:text-[#1877F2] transition-colors"
                                    aria-label="Share on Facebook"
                                >
                                    <Facebook className="w-5 h-5 mx-auto" />
                                </button>
                                <button
                                    onClick={() => handleShare('copy')}
                                    className="flex-1 p-3 rounded-xl bg-[#1e2749] hover:bg-success-500/20 text-slate-400 hover:text-success-400 transition-colors"
                                    aria-label="Copy link"
                                >
                                    {isCopied ? (
                                        <Check className="w-5 h-5 mx-auto text-success-400" />
                                    ) : (
                                        <Copy className="w-5 h-5 mx-auto" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Book Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Author */}
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-2">
                            {book.title}
                        </h1>
                        <p className="text-xl text-slate-400">
                            by {book.authors?.join(', ') || 'Unknown Author'}
                        </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4">
                        {book.publishedDate && (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar className="w-4 h-4" />
                                <span>{book.publishedDate}</span>
                            </div>
                        )}
                        {book.pageCount && book.pageCount > 0 && (
                            <div className="flex items-center gap-2 text-slate-400">
                                <FileText className="w-4 h-4" />
                                <span>{book.pageCount} pages</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-400">
                            <Tag className="w-4 h-4" />
                            <span>ISBN: {book.isbn}</span>
                        </div>
                        {readingTime && (
                            <div className="flex items-center gap-2 text-slate-400">
                                <BookOpen className="w-4 h-4" />
                                <span>~{readingTime}h read</span>
                            </div>
                        )}
                    </div>

                    {/* Categories */}
                    {book.categories && book.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {book.categories.map((category, i) => (
                                <span key={i} className="px-3 py-1 rounded-lg bg-primary-500/10 text-primary-400 text-sm font-medium border border-primary-500/20">
                                    {category}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {book.description && (
                        <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-400" />
                                About This Book
                            </h2>
                            <div
                                className="text-slate-300 leading-relaxed prose prose-invert max-w-none prose-p:text-slate-300 prose-a:text-primary-400"
                                dangerouslySetInnerHTML={{ __html: book.description }}
                            />
                        </div>
                    )}

                    {/* Community Reviews - Show first for social proof */}
                    {internalBookId && (
                        <CommunityReviews
                            key={`reviews-${lastReviewUpdate}`}
                            bookId={internalBookId}
                            currentUserId={userId}
                        />
                    )}

                    {/* My Review - Only for Finished Books */}
                    {shelfStatus === 'completed' && (
                        <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6 animate-fade-in">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-accent-400" />
                                My Review
                            </h2>

                            <div className="space-y-4">
                                {/* Rating Input with Half-Stars */}
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 text-sm">Rating:</span>
                                    <StarRating
                                        rating={rating}
                                        onChange={setRating}
                                        size="lg"
                                        showValue
                                    />
                                </div>

                                <textarea
                                    className="w-full bg-[#0a0e27] border border-[#1e2749] rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="Write your thoughts..."
                                    rows={4}
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                />

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isReviewPublic ? 'bg-primary-500' : 'bg-slate-700'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isReviewPublic ? 'translate-x-4' : ''}`} />
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isReviewPublic}
                                                onChange={(e) => setIsReviewPublic(e.target.checked)}
                                            />
                                        </div>
                                        <span className={`text-sm ${isReviewPublic ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                            Public Review
                                        </span>
                                    </label>

                                    <button
                                        onClick={handleSaveReview}
                                        disabled={isSavingReview}
                                        className="btn-primary px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSavingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {isSavingReview ? 'Saving...' : 'Save Review'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buying Options - Collapsible */}
                    <details className="group" open>
                        <summary className="cursor-pointer list-none">
                            <div className="flex items-center justify-between bg-gradient-to-r from-success-500/10 to-emerald-500/5 border border-success-500/30 rounded-2xl p-4 hover:border-success-500/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 rounded-xl bg-success-500/20 border border-success-500/30">
                                        <ShoppingCart className="w-5 h-5 text-success-400" />
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Where to Buy</h2>
                                        <p className="text-xs text-slate-400">Check availability & prices</p>
                                    </div>
                                </div>
                                <div className="text-slate-400 group-open:rotate-180 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </summary>
                        <div className="mt-4">
                            <PriceTable prices={book.prices || []} />
                        </div>
                    </details>


                </div>
            </div>
        </div>
    );
}
