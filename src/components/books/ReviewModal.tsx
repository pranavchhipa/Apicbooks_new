'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { updateReview } from '@/lib/api/library';
import { X, Star, MessageSquare, Check, Loader2, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import StarRating, { getRatingLabel } from '@/components/StarRating';
import ThumbsDownFeedback from '@/components/books/ThumbsDownFeedback';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookId: string;
    bookTitle: string;
    onReviewSubmitted: () => void;
}

export default function ReviewModal({ isOpen, onClose, bookId, bookTitle, onReviewSubmitted }: ReviewModalProps) {
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [dislikeReasons, setDislikeReasons] = useState<string[]>([]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Allow 0 stars ONLY if they have selected dislike reasons
        if (rating === 0 && dislikeReasons.length === 0) {
            toast.error("Please add a star rating or select why you didn't enjoy it!");
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('You must be logged in to review books');
                return;
            }

            // Pass the float rating directly — column supports NUMERIC(3,1)
            await updateReview(user.id, bookId, rating, review, isPublic, dislikeReasons);

            toast.success('Review published successfully!');
            onReviewSubmitted();
            onClose();
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            const errorMessage = error?.message || error?.error_description || 'Failed to submit review';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-background dark:bg-[#0c0a14] border border-card-border rounded-2xl shadow-2xl overflow-hidden scale-in-center max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-card-border bg-slate-50/50 dark:bg-[#141b3d]/50">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Rate & Review</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[250px]">{bookTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-elevated text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Star Rating with praise label */}
                    <div className="flex flex-col items-center justify-center space-y-2 py-2">
                        <StarRating rating={rating} onChange={setRating} size="lg" showLabel />
                    </div>

                    {/* Thumbs-Down Feedback */}
                    <ThumbsDownFeedback
                        selectedReasons={dislikeReasons}
                        onChange={setDislikeReasons}
                    />

                    {/* Review Text */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2 uppercase flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" />
                            Your Review (Optional)
                        </label>
                        <textarea
                            value={review}
                            onChange={e => setReview(e.target.value)}
                            className="w-full h-32 bg-slate-50 dark:bg-card border border-slate-200 dark:border-card-border rounded-xl p-4 text-slate-900 dark:text-white resize-none focus:outline-none focus:border-primary-500 transition-colors placeholder-slate-400 dark:placeholder-slate-600"
                            placeholder="What did you think about this book?"
                        />
                    </div>

                    {/* Privacy Toggle */}
                    <div
                        onClick={() => setIsPublic(!isPublic)}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#141b3d]/50 border border-slate-200 dark:border-card-border rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-elevated transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isPublic ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'}`}>
                                {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{isPublic ? 'Public Review' : 'Private Note'}</p>
                                <p className="text-xs text-slate-500">{isPublic ? 'Visible to everyone' : 'Only visible to you'}</p>
                            </div>
                        </div>
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${isPublic ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${isPublic ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
