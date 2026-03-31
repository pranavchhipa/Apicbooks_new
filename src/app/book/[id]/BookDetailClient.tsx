'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addToLibrary, updateLibraryProgress, type ReadingStatus } from '@/lib/api/library';
import { toast } from 'sonner';
import {
    BookOpen,
    Heart,
    CheckCircle,
    ChevronDown,
    Loader2,
    Check,
    Share2,
    Twitter,
    Facebook,
    Copy,
    Star,
    Globe,
    Lock,
} from 'lucide-react';
import StarRating from '@/components/StarRating';

interface BookDetailClientProps {
    bookId: string;
    bookTitle: string;
    bookCoverUrl: string | null;
    pageCount: number | null;
    internalBookId: string | null;
}

const SHELF_OPTIONS: { label: string; value: ReadingStatus; icon: typeof Heart; color: string; bgColor: string }[] = [
    { label: 'Want to Read', value: 'wishlist', icon: Heart, color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15' },
    { label: 'Currently Reading', value: 'reading', icon: BookOpen, color: 'text-amber-400', bgColor: 'bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.06]' },
    { label: 'Mark as Read', value: 'completed', icon: CheckCircle, color: 'text-amber-400', bgColor: 'bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.06]' },
];

export default function BookDetailClient({
    bookId,
    bookTitle,
    bookCoverUrl,
    pageCount,
    internalBookId: initialInternalBookId,
}: BookDetailClientProps) {
    const supabase = createClient();

    // Shelf state
    const [shelfStatus, setShelfStatus] = useState<ReadingStatus | null>(null);
    const [isShelving, setIsShelving] = useState(false);
    const [showShelfMenu, setShowShelfMenu] = useState(false);
    const [internalBookId, setInternalBookId] = useState<string | null>(initialInternalBookId);

    // Progress state
    const [currentPage, setCurrentPage] = useState(0);
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

    // Review state
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSavingReview, setIsSavingReview] = useState(false);
    const [isReviewPublic, setIsReviewPublic] = useState(true);

    // Share state
    const [isCopied, setIsCopied] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    // User state
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    // Load user and their book status
    useEffect(() => {
        async function loadUserStatus() {
            setIsLoadingUser(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoadingUser(false);
                    return;
                }

                setUserId(user.id);

                // Find internal book ID if not provided
                let targetUuid = internalBookId;
                if (!targetUuid) {
                    const { data: bookRecord } = await supabase
                        .from('books')
                        .select('id')
                        .eq('google_id', bookId)
                        .single();

                    if (bookRecord) {
                        targetUuid = bookRecord.id;
                        setInternalBookId(targetUuid);
                    }
                }

                if (targetUuid) {
                    const { data: entry } = await supabase
                        .from('user_library')
                        .select('status, rating, review, current_page, is_review_public')
                        .eq('user_id', user.id)
                        .eq('book_id', targetUuid)
                        .single();

                    if (entry) {
                        setShelfStatus(entry.status);
                        setRating(entry.rating || 0);
                        setReviewText(entry.review || '');
                        setCurrentPage(entry.current_page || 0);
                        setIsReviewPublic(entry.is_review_public !== false);
                    }
                }
            } catch (err) {
                console.error('Error loading user status:', err);
            } finally {
                setIsLoadingUser(false);
            }
        }

        loadUserStatus();
    }, [bookId]);

    // Handlers
    const handleShelfUpdate = async (newStatus: ReadingStatus) => {
        setIsShelving(true);
        setShowShelfMenu(false);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Please sign in to save books.');
                return;
            }

            const item = await addToLibrary(user.id, bookId, newStatus);
            if (item?.book_id) {
                setInternalBookId(item.book_id);
            }

            setShelfStatus(newStatus);
            const labels: Record<ReadingStatus, string> = {
                wishlist: 'Want to Read',
                reading: 'Currently Reading',
                completed: 'Marked as Read',
            };
            toast.success(`${labels[newStatus]}`);
        } catch (e) {
            console.error(e);
            toast.error('Failed to update shelf');
        } finally {
            setIsShelving(false);
        }
    };

    const handleProgressUpdate = async () => {
        setIsUpdatingProgress(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let currentUUID = internalBookId;
            if (!currentUUID) {
                const item = await addToLibrary(user.id, bookId, shelfStatus || 'reading');
                currentUUID = item.book_id;
                setInternalBookId(currentUUID);
            }

            await updateLibraryProgress(user.id, currentUUID!, currentPage);

            if (pageCount && currentPage >= pageCount && shelfStatus === 'reading') {
                await handleShelfUpdate('completed');
                toast.success('Congratulations on finishing the book!');
            } else {
                toast.success('Progress updated!');
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to update progress');
        } finally {
            setIsUpdatingProgress(false);
        }
    };

    const handleSaveReview = async () => {
        setIsSavingReview(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let targetUUID = internalBookId;
            if (!targetUUID) {
                const item = await addToLibrary(user.id, bookId, shelfStatus || 'completed');
                targetUUID = item.book_id;
                setInternalBookId(targetUUID);
                if (!shelfStatus) setShelfStatus('completed');
            }

            const payload = {
                user_id: user.id,
                book_id: targetUUID!,
                rating,
                review: reviewText,
                status: shelfStatus || 'completed',
                is_review_public: isReviewPublic,
            };

            const { error: upsertError } = await supabase
                .from('user_library')
                .upsert(payload, { onConflict: 'user_id,book_id' });

            if (upsertError) throw upsertError;

            toast.success('Review saved!');

            // Log activity for Pulse feed
            if (isReviewPublic) {
                const { logActivity } = await import('@/components/ActivityFeed');
                await logActivity(
                    user.id,
                    'reviewed',
                    targetUUID!,
                    bookTitle,
                    bookCoverUrl || undefined,
                    {
                        rating,
                        review_snippet: reviewText.substring(0, 150) + (reviewText.length > 150 ? '...' : ''),
                        description: reviewText,
                    }
                );
            }
        } catch (e) {
            toast.error('Failed to save review');
            console.error(e);
        } finally {
            setIsSavingReview(false);
        }
    };

    const handleShare = async (platform: string) => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const text = `Check out "${bookTitle}" on ApicBooks!`;

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
                toast.success('Link copied!');
                setTimeout(() => setIsCopied(false), 2000);
                break;
        }
        setShowShareMenu(false);
    };

    const currentShelfOption = SHELF_OPTIONS.find(o => o.value === shelfStatus);
    const progressPercent = pageCount ? Math.min(100, Math.round((currentPage / pageCount) * 100)) : 0;

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5 sm:p-6 shadow-glass">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Shelf Dropdown */}
                    <div className="relative flex-1">
                        <button
                            onClick={() => {
                                if (!userId && !isLoadingUser) {
                                    toast.error('Please sign in to save books.');
                                    return;
                                }
                                setShowShelfMenu(!showShelfMenu);
                            }}
                            disabled={isShelving || isLoadingUser}
                            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl font-semibold transition-all duration-200 border text-sm ${
                                currentShelfOption
                                    ? `${currentShelfOption.bgColor} ${currentShelfOption.color}`
                                    : 'bg-amber-500 text-midnight hover:bg-amber-400 border-amber-500'
                            } disabled:opacity-50`}
                        >
                            <span className="flex items-center gap-2">
                                {isShelving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : currentShelfOption ? (
                                    <currentShelfOption.icon className="w-4 h-4" />
                                ) : (
                                    <BookOpen className="w-4 h-4" />
                                )}
                                {currentShelfOption ? currentShelfOption.label : 'Add to My Books'}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showShelfMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showShelfMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowShelfMenu(false)}
                                />
                                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#14141a] border border-white/[0.06] rounded-xl shadow-glass z-50 animate-slide-down">
                                    {SHELF_OPTIONS.map((option) => {
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => handleShelfUpdate(option.value)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.05] transition-colors text-left group ${
                                                    shelfStatus === option.value ? 'bg-white/[0.05]' : ''
                                                }`}
                                            >
                                                <Icon className={`w-4 h-4 ${option.color}`} />
                                                <span className={`flex-1 font-medium text-sm ${
                                                    shelfStatus === option.value ? 'text-amber-400' : 'text-white/60 group-hover:text-white'
                                                }`}>
                                                    {option.label}
                                                </span>
                                                {shelfStatus === option.value && (
                                                    <CheckCircle className="w-4 h-4 text-amber-400" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Share Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="btn-secondary py-3.5 px-5 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>

                        {showShareMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowShareMenu(false)}
                                />
                                <div className="absolute top-full right-0 mt-2 p-2 bg-[#14141a] border border-white/[0.06] rounded-xl shadow-glass z-50 w-48 animate-slide-down">
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors text-sm text-white/60 hover:text-white"
                                    >
                                        <Twitter className="w-4 h-4" />
                                        Twitter
                                    </button>
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors text-sm text-white/60 hover:text-white"
                                    >
                                        <Facebook className="w-4 h-4" />
                                        Facebook
                                    </button>
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors text-sm text-white/60 hover:text-white"
                                    >
                                        {isCopied ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4" />}
                                        {isCopied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Reading Progress */}
                {shelfStatus === 'reading' && (
                    <div className="mt-5 pt-5 border-t border-white/[0.06] animate-fade-in">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-white">Reading Progress</h3>
                            <span className="text-sm font-bold text-amber-400">
                                {progressPercent}%
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    value={currentPage}
                                    onChange={(e) => setCurrentPage(Math.min(Number(e.target.value), pageCount || 100000))}
                                    className="input-field py-2.5 pr-16 text-sm bg-white/[0.04] border-white/[0.06] text-white placeholder:text-white/30"
                                    placeholder="Current page"
                                    min={0}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40">
                                    / {pageCount || '?'}
                                </span>
                            </div>
                            <button
                                onClick={handleProgressUpdate}
                                disabled={isUpdatingProgress}
                                className="btn-primary py-2.5 px-4 text-sm"
                            >
                                {isUpdatingProgress ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Review Section - Only for finished books */}
            {shelfStatus === 'completed' && (
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5 sm:p-6 shadow-glass animate-fade-in">
                    <h3 className="text-lg font-display font-bold text-white mb-5">
                        Your Review
                    </h3>

                    <div className="space-y-5">
                        {/* Rating */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white/50">Your Rating:</span>
                            <StarRating
                                rating={rating}
                                onChange={setRating}
                                size="lg"
                                showValue
                            />
                        </div>

                        {/* Review text */}
                        <textarea
                            className="input-field min-h-[120px] resize-y font-serif bg-white/[0.04] border-white/[0.06] text-white placeholder:text-white/30"
                            placeholder="Share your thoughts about this book..."
                            rows={4}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />

                        {/* Public toggle and save */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <button
                                    type="button"
                                    onClick={() => setIsReviewPublic(!isReviewPublic)}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                                        isReviewPublic ? 'bg-amber-500' : 'bg-white/20'
                                    }`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                        isReviewPublic ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                                </button>
                                <span className="flex items-center gap-1.5 text-sm text-white/60">
                                    {isReviewPublic ? (
                                        <>
                                            <Globe className="w-3.5 h-3.5" />
                                            Public
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-3.5 h-3.5" />
                                            Private
                                        </>
                                    )}
                                </span>
                            </label>

                            <button
                                onClick={handleSaveReview}
                                disabled={isSavingReview}
                                className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSavingReview ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Review'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
