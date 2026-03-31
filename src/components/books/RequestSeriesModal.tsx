import React, { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface RequestSeriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookId: string;
    bookTitle: string;
}

export default function RequestSeriesModal({ isOpen, onClose, bookId, bookTitle }: RequestSeriesModalProps) {
    const [seriesName, setSeriesName] = useState('');
    const [seriesOrder, setSeriesOrder] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!seriesName.trim()) {
            toast.error("Please enter a series name");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const payload = {
                book_id: bookId,
                book_title: bookTitle,
                suggested_series: seriesName.trim(),
                suggested_order: seriesOrder ? parseFloat(seriesOrder) : null,
                user_id: user?.id || null, // Allow anonymous requests if feasible, or enforce auth elsewhere
                status: 'pending'
            };

            const { error } = await supabase
                .from('series_requests')
                .insert(payload);

            if (error) throw error;

            toast.success("Thanks! Our librarians are updating this record.");
            onClose();
            setSeriesName('');
            setSeriesOrder('');
        } catch (error) {
            console.error("Error submitting series request:", error);
            toast.error("Failed to submit request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-[#1e2749]/90 backdrop-blur-xl border border-violet-500/20 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gradient-to-r from-violet-500/10 to-transparent">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-xl">📚</span>
                        Suggest Series Info
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-200 text-sm mb-4">
                        Help us improve! Tell us which series <strong>{bookTitle}</strong> belongs to.
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Series Name</label>
                        <input
                            type="text"
                            value={seriesName}
                            onChange={(e) => setSeriesName(e.target.value)}
                            placeholder="e.g. Harry Potter"
                            className="w-full bg-[#0a0e27] border border-[#2d3b6b] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                            Book Number <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={seriesOrder}
                            onChange={(e) => setSeriesOrder(e.target.value)}
                            placeholder="e.g. 1"
                            className="w-full bg-[#0a0e27] border border-[#2d3b6b] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                        />
                    </div>

                    {/* Footer */}
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !seriesName.trim()}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
