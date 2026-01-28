'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createManualBook, ReadingStatus } from '@/lib/api/library';
import { X, Book, User, FileText, Check, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBookAdded: () => void;
    currentTab?: string;
}

export default function AddBookModal({ isOpen, onClose, onBookAdded, currentTab }: AddBookModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        pageCount: '',
        status: (currentTab === 'want_to_read' ? 'wishlist' : currentTab === 'read' ? 'completed' : 'reading') as ReadingStatus
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('You must be logged in to add books');
                return;
            }

            await createManualBook(user.id, {
                title: formData.title,
                authors: [formData.author],
                page_count: parseInt(formData.pageCount) || 0,
                status: formData.status,
                categories: ['Manual Entry']
            });

            toast.success('Book added successfully!');
            onBookAdded();
            onClose();
            // Reset form
            setFormData({
                title: '',
                author: '',
                pageCount: '',
                status: 'reading'
            });
        } catch (error) {
            console.error('Failed to add book:', error);
            toast.error('Failed to add book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-[#0a0e27] border border-[#1e2749] rounded-2xl shadow-2xl overflow-hidden scale-in-center">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#1e2749] bg-[#141b3d]/50">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary-400" />
                        Add Manually
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#1e2749] text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Title</label>
                        <div className="relative">
                            <Book className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-[#141b3d] border border-[#1e2749] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors placeholder-slate-600"
                                placeholder="Book Title"
                            />
                        </div>
                    </div>

                    {/* Author */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Author</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                required
                                value={formData.author}
                                onChange={e => setFormData({ ...formData, author: e.target.value })}
                                className="w-full bg-[#141b3d] border border-[#1e2749] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors placeholder-slate-600"
                                placeholder="Author Name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Page Count */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Pages</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.pageCount}
                                    onChange={e => setFormData({ ...formData, pageCount: e.target.value })}
                                    className="w-full bg-[#141b3d] border border-[#1e2749] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors placeholder-slate-600"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as ReadingStatus })}
                                className="w-full bg-[#141b3d] border border-[#1e2749] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="reading">Reading</option>
                                <option value="wishlist">Want to Read</option>
                                <option value="completed">Finished</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            {loading ? 'Adding Book...' : 'Add to Library'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
