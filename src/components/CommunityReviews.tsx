'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Star, User, MessageSquare, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import StarRating from '@/components/StarRating';

interface Review {
    id: string;
    user_id: string;
    rating: number;
    review: string | null;
    updated_at: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

interface CommunityReviewsProps {
    bookId: string;
    currentUserId?: string;
}

export default function CommunityReviews({ bookId, currentUserId }: CommunityReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);
    const [showAll, setShowAll] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);

            // Debug Log
            console.log(`[CommunityReviews] Fetching... Book: ${bookId}, User: ${currentUserId}`);

            // Base query
            let query = supabase
                .from('user_library')
                .select(`
                    id,
                    user_id,
                    rating,
                    review,
                    is_review_public,
                    updated_at,
                    profiles:user_id (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('book_id', bookId)
                .not('rating', 'is', null)
                .order('updated_at', { ascending: false });

            // Allow viewing public reviews OR your own review
            // Using a safer OR syntax that definitely works
            if (currentUserId) {
                // "is_review_public is true OR user_id is me"
                query = query.or(`is_review_public.eq.true,user_id.eq.${currentUserId}`);
            } else {
                query = query.eq('is_review_public', true);
            }

            const { data, error } = await query;

            if (error) {
                console.error('[CommunityReviews] Error fetching reviews:', error);
                setLoading(false);
                return;
            }

            console.log('[CommunityReviews] Data fetched:', data?.length, data);

            // Temporary Debug info in console
            if (data?.length === 0) {
                console.warn('[CommunityReviews] No reviews found. Check RLS or filters.');
            }

            const reviewsData = (data || []) as unknown as Review[];

            // Sort: Current user's review first, then by date
            const sortedReviews = reviewsData.sort((a, b) => {
                if (a.user_id === currentUserId) return -1;
                if (b.user_id === currentUserId) return 1;
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            });

            setReviews(sortedReviews);

            // Calculate average rating
            if (reviewsData.length > 0) {
                const avg = reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length;
                setAverageRating(avg);
            }

            setLoading(false);
        };

        fetchReviews();
    }, [bookId, currentUserId]);

    const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

    if (loading) {
        return (
            <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-700 rounded w-1/3" />
                    <div className="h-20 bg-slate-700/50 rounded" />
                    <div className="h-20 bg-slate-700/50 rounded" />
                </div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                        <MessageSquare className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Community Reviews</h3>
                </div>
                <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                        <MessageSquare className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Community Reviews</h3>
                        <p className="text-xs text-slate-400">
                            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                            {/* Debug info: hidden in prod, visible now for check */}
                            {currentUserId ? '' : ' (Guest)'}
                        </p>
                    </div>
                </div>

                {/* Average Rating */}
                <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0e27]/50 rounded-xl border border-card-border">
                    <StarRating rating={averageRating} readonly size="sm" />
                    <span className="text-white font-bold">{averageRating.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">({reviews.length})</span>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {displayedReviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-[#0a0e27]/30 border border-card-border/50 rounded-xl p-4 hover:border-card-border transition-colors"
                    >
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {review.profiles?.avatar_url ? (
                                    <Image
                                        src={review.profiles.avatar_url}
                                        alt={review.profiles.full_name || 'User'}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-white">
                                        {review.user_id === currentUserId ? 'You' : (review.profiles?.full_name || 'Anonymous Reader')}
                                    </span>
                                    {review.user_id === currentUserId && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-500/20 text-primary-400 border border-primary-500/30">
                                            YOU
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-500">•</span>
                                    <span className="text-xs text-slate-500">
                                        {new Date(review.updated_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Rating */}
                                <div className="mb-2">
                                    <StarRating rating={review.rating} readonly size="sm" />
                                </div>

                                {/* Review Text */}
                                {/* Review Text */}
                                {review.review ? (
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        "{review.review}"
                                    </p>
                                ) : (
                                    <div className="text-xs text-rose-400 border border-rose-900/50 p-2 rounded bg-rose-950/30">
                                        Debug: Review text is empty/null.
                                        <br />
                                        Raw: {JSON.stringify(review)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More/Less */}
            {reviews.length > 3 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full mt-4 py-3 text-sm text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2 transition-colors"
                >
                    {showAll ? (
                        <>
                            <ChevronUp className="w-4 h-4" />
                            Show Less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" />
                            Show All {reviews.length} Reviews
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
