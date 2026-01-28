'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { updateReview } from '@/lib/api/library';
import { X, Star, MessageSquare, Check, Loader2, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import StarRating from '@/components/StarRating';

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

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please add a star rating!");
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

            // Database expects an integer for rating, so we round it
            await updateReview(user.id, bookId, Math.round(rating), review, isPublic);

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
            <div className="w-full max-w-md bg-[#0a0e27] border border-[#1e2749] rounded-2xl shadow-2xl overflow-hidden scale-in-center max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#1e2749] bg-[#141b3d]/50">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Rate & Review</h2>
                        <p className="text-sm text-slate-400 truncate max-w-[250px]">{bookTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#1e2749] text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Star Rating */}
                    <div className="flex flex-col items-center justify-center space-y-2 py-2">
                        <StarRating rating={rating} onChange={setRating} size="lg" />
                        <span className="text-sm text-slate-400 font-medium">
                            {rating === 0 ? 'Tap to rate' : rating === 5 ? 'Masterpiece!' : rating === 4 ? 'Great read' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Not for me'}
                        </span>
                    </div>

                    {/* Review Text */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" />
                            Your Review (Optional)
                        </label>
                        <textarea
                            value={review}
                            onChange={e => setReview(e.target.value)}
                            className="w-full h-32 bg-[#141b3d] border border-[#1e2749] rounded-xl p-4 text-white resize-none focus:outline-none focus:border-primary-500 transition-colors placeholder-slate-600"
                            placeholder="What did you think about this book?"
                        />
                    </div>

                    {/* Privacy Toggle */}
                    <div
                        onClick={() => setIsPublic(!isPublic)}
                        className="flex items-center justify-between p-3 bg-[#141b3d]/50 border border-[#1e2749] rounded-xl cursor-pointer hover:bg-[#1e2749] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isPublic ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-white">{isPublic ? 'Public Review' : 'Private Note'}</p>
                                <p className="text-xs text-slate-500">{isPublic ? 'Visible to everyone' : 'Only visible to you'}</p>
                            </div>
                        </div>
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${isPublic ? 'bg-primary-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
