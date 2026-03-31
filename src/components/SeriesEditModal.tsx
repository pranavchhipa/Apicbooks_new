'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Save, Loader2, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SeriesEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookId: string;
    currentSeriesName?: string | null;
    currentSeriesOrder?: number | null;
    onSave?: () => void;
}

export default function SeriesEditModal({ isOpen, onClose, bookId, currentSeriesName, currentSeriesOrder, onSave }: SeriesEditModalProps) {
    const [seriesName, setSeriesName] = useState(currentSeriesName || '');
    const [seriesOrder, setSeriesOrder] = useState(currentSeriesOrder?.toString() || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            setSeriesName(currentSeriesName || '');
            setSeriesOrder(currentSeriesOrder?.toString() || '');
            setError(null);
        }
    }, [isOpen, currentSeriesName, currentSeriesOrder]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('You must be logged in to edit series info.');
            }

            // Update global metadata
            const { updateGlobalSeriesMetadata } = await import('@/lib/api/metadata');
            await updateGlobalSeriesMetadata(
                bookId,
                seriesName.trim() || null,
                seriesOrder ? parseFloat(seriesOrder) : null
            );

            if (onSave) onSave();
            onClose();
            router.refresh();

        } catch (err: any) {
            console.error('Failed to save series info:', err);
            setError(err.message || 'Failed to save.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !mounted) return null;

    const { createPortal } = require('react-dom');

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-violet-500" />
                        Edit Series Info
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Series Name
                        </label>
                        <input
                            type="text"
                            value={seriesName}
                            onChange={(e) => setSeriesName(e.target.value)}
                            placeholder="e.g. Harry Potter"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Enter the series name without "The" or "Series" if possible.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Book Number
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={seriesOrder}
                            onChange={(e) => setSeriesOrder(e.target.value)}
                            placeholder="e.g. 1"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
