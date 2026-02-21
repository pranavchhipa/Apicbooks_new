'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { StickyNote, Quote, Plus, Trash2, BookOpen, X, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface BookNote {
    id: string;
    type: 'note' | 'quote';
    content: string;
    page_number: number | null;
    created_at: string;
}

interface NotesQuotesPanelProps {
    libraryId: string;
    bookTitle: string;
    currentPage?: number;
    compact?: boolean; // for inline use in end-session modal
}

type TabType = 'note' | 'quote';

export default function NotesQuotesPanel({
    libraryId,
    bookTitle,
    currentPage = 0,
    compact = false,
}: NotesQuotesPanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>('note');
    const [notes, setNotes] = useState<BookNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // form fields
    const [content, setContent] = useState('');
    const [pageNum, setPageNum] = useState<string>(currentPage.toString());
    const [saving, setSaving] = useState(false);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data, error } = await supabase
            .from('book_notes')
            .select('*')
            .eq('library_id', libraryId)
            .eq('user_id', user.id)
            .eq('type', activeTab)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setNotes(data);
        }
        setLoading(false);
    }, [libraryId, activeTab]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    useEffect(() => {
        setPageNum(currentPage.toString());
    }, [currentPage]);

    const handleSave = async () => {
        if (!content.trim()) {
            toast.error('Please write something first');
            return;
        }

        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSaving(false); return; }

        const { error } = await supabase.from('book_notes').insert({
            user_id: user.id,
            library_id: libraryId,
            type: activeTab,
            content: content.trim(),
            page_number: parseInt(pageNum) || null,
        });

        if (error) {
            toast.error(`Failed to save ${activeTab}: ${error.message || error.code || 'Unknown error'}`);
            console.error('Supabase save error:', JSON.stringify(error, null, 2));
        } else {
            toast.success(`${activeTab === 'note' ? 'Note' : 'Quote'} saved!`);
            setContent('');
            setShowForm(false);
            fetchNotes();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('book_notes')
            .delete()
            .eq('id', id);

        if (!error) {
            setNotes(prev => prev.filter(n => n.id !== id));
            toast.success('Deleted');
        }
    };

    const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
        { key: 'note', label: 'Notes', icon: StickyNote },
        { key: 'quote', label: 'Quotes', icon: Quote },
    ];

    return (
        <div className={`${compact ? '' : 'bg-[#141b3d]/60 dark:bg-[#141b3d]/60 bg-white/60 backdrop-blur-xl border border-slate-200 dark:border-card-border rounded-2xl overflow-hidden'}`}>
            {/* Tabs */}
            <div className={`flex ${compact ? 'gap-2 mb-3' : 'border-b border-slate-200 dark:border-card-border'}`}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setShowForm(false); }}
                        className={`
                            flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all
                            ${compact ? 'rounded-lg' : 'flex-1 justify-center'}
                            ${activeTab === tab.key
                                ? compact
                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                    : 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/5'
                                : 'text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 hover:text-slate-600'
                            }
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {!loading && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary-500/20 text-primary-300' : 'bg-slate-700/50 dark:bg-slate-700/50 bg-slate-200 text-slate-400'}`}>
                                {activeTab === tab.key ? notes.length : ''}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content area */}
            <div className={compact ? '' : 'p-4'}>
                {/* Add button */}
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`
                        flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all mb-3
                        ${showForm
                            ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                            : 'bg-slate-800/50 dark:bg-slate-800/50 bg-slate-100 text-slate-300 dark:text-slate-300 text-slate-600 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-slate-200 border border-slate-700/30 dark:border-slate-700/30 border-slate-300'
                        }
                    `}
                >
                    <Plus className={`w-4 h-4 transition-transform ${showForm ? 'rotate-45' : ''}`} />
                    {showForm ? 'Cancel' : `Add ${activeTab === 'note' ? 'Note' : 'Quote'}`}
                </button>

                {/* Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mb-4"
                        >
                            <div className="space-y-3 p-4 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 bg-slate-50 border border-slate-700/30 dark:border-slate-700/30 border-slate-200">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={activeTab === 'note'
                                        ? 'Write your thoughts about this section...'
                                        : '"Paste or type a quote from the book..."'
                                    }
                                    rows={compact ? 2 : 4}
                                    className="w-full px-4 py-3 bg-[#0a0e27] dark:bg-[#0a0e27] bg-white border border-card-border dark:border-card-border border-slate-200 rounded-xl text-foreground placeholder:text-slate-500 focus:border-primary-500 outline-none transition-colors resize-none"
                                    autoFocus
                                />
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 flex-1">
                                        <BookOpen className="w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            value={pageNum}
                                            onChange={(e) => setPageNum(e.target.value)}
                                            placeholder="Page #"
                                            className="w-24 px-3 py-2 bg-[#0a0e27] dark:bg-[#0a0e27] bg-white border border-card-border dark:border-card-border border-slate-200 rounded-lg text-sm text-foreground focus:border-primary-500 outline-none"
                                        />
                                        <span className="text-xs text-slate-500">Page number</span>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !content.trim()}
                                        className="px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notes/Quotes list */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-20 bg-slate-800/30 dark:bg-slate-800/30 bg-orange-50/50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800/50 dark:bg-slate-800/50 bg-orange-50/80 flex items-center justify-center">
                            {activeTab === 'note'
                                ? <StickyNote className="w-6 h-6 text-slate-500" />
                                : <Quote className="w-6 h-6 text-slate-500" />
                            }
                        </div>
                        <p className="text-sm text-slate-400">
                            No {activeTab === 'note' ? 'notes' : 'quotes'} yet
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {activeTab === 'note'
                                ? 'Capture your thoughts as you read'
                                : 'Save memorable passages from the book'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {notes.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`
                                    group relative p-4 rounded-xl border transition-all
                                    ${activeTab === 'quote'
                                        ? 'bg-amber-500/5 dark:bg-amber-500/5 bg-amber-50/80 border-amber-500/20 dark:border-amber-500/20 border-amber-200/60'
                                        : 'bg-slate-800/30 dark:bg-slate-800/30 bg-white/80 border-slate-700/30 dark:border-slate-700/30 border-orange-100/50 shadow-sm'
                                    }
                                `}
                            >
                                {activeTab === 'quote' && (
                                    <Quote className="w-4 h-4 text-amber-400/50 mb-2" />
                                )}
                                <p className={`text-sm leading-relaxed ${activeTab === 'quote' ? 'italic text-slate-200 dark:text-slate-200 text-slate-700' : 'text-slate-300 dark:text-slate-300 text-slate-700'}`}>
                                    {item.content}
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        {item.page_number && (
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" />
                                                Page {item.page_number}
                                            </span>
                                        )}
                                        <span>
                                            {new Date(item.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
