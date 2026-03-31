'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
    BookMarked, Search, FileText, Quote, Star, Calendar, Clock,
    BookOpen, ThumbsDown, ChevronDown, ChevronUp
} from 'lucide-react';
import StarRating, { getRatingLabel } from '@/components/StarRating';

type TabType = 'notes' | 'quotes' | 'reviews';

interface BookNote {
    id: string;
    type: 'note' | 'quote';
    content: string;
    page_number: number | null;
    created_at: string;
    library_id: string;
    book_id: string;
    // joined from user_library -> books
    book_title: string;
    book_cover: string;
    authors: string[];
}

interface JournalReview {
    id: string;
    rating: number;
    review: string;
    book_id: string;
    book_title: string;
    book_cover: string;
    authors: string[];
    updated_at: string;
    is_public: boolean;
    dislike_reasons: string[];
}

export default function JournalPage() {
    const [activeTab, setActiveTab] = useState<TabType>('notes');
    const [notes, setNotes] = useState<BookNote[]>([]);
    const [quotes, setQuotes] = useState<BookNote[]>([]);
    const [reviews, setReviews] = useState<JournalReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'book' | 'rating'>('newest');

    useEffect(() => {
        fetchJournalData();
    }, []);

    const fetchJournalData = async () => {
        setLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch notes and quotes from book_notes, with book info via user_library -> books
            const { data: bookNotesData, error: notesError } = await supabase
                .from('book_notes')
                .select(`
                    id, type, content, page_number, created_at, library_id
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (notesError) {
                console.error('Error fetching book notes:', notesError);
            }

            // For each note/quote, fetch the book info via the library_id
            let enrichedNotes: BookNote[] = [];
            let enrichedQuotes: BookNote[] = [];

            if (bookNotesData && bookNotesData.length > 0) {
                // Collect unique library_ids
                const libraryIds = Array.from(new Set(bookNotesData.map(n => n.library_id)));

                // Fetch library items with book details
                const { data: libraryData } = await supabase
                    .from('user_library')
                    .select(`
                        id,
                        book_id,
                        book:books (title, cover_url, authors)
                    `)
                    .in('id', libraryIds);

                // Build lookup map
                const libraryMap = new Map<string, { book_id: string; title: string; cover_url: string; authors: string[] }>();
                if (libraryData) {
                    for (const item of libraryData) {
                        const book = item.book as any;
                        if (book) {
                            libraryMap.set(item.id, {
                                book_id: item.book_id,
                                title: book.title || 'Unknown Book',
                                cover_url: book.cover_url || '',
                                authors: book.authors || [],
                            });
                        }
                    }
                }

                // Enrich each note/quote
                for (const entry of bookNotesData) {
                    const bookInfo = libraryMap.get(entry.library_id) || {
                        book_id: '',
                        title: 'Unknown Book',
                        cover_url: '',
                        authors: [],
                    };

                    const enriched: BookNote = {
                        id: entry.id,
                        type: entry.type as 'note' | 'quote',
                        content: entry.content,
                        page_number: entry.page_number,
                        created_at: entry.created_at,
                        library_id: entry.library_id,
                        book_id: bookInfo.book_id,
                        book_title: bookInfo.title,
                        book_cover: bookInfo.cover_url,
                        authors: bookInfo.authors,
                    };

                    if (entry.type === 'note') {
                        enrichedNotes.push(enriched);
                    } else {
                        enrichedQuotes.push(enriched);
                    }
                }
            }

            setNotes(enrichedNotes);
            setQuotes(enrichedQuotes);

            // Fetch reviews from user_library
            const { data: reviewData, error: reviewError } = await supabase
                .from('user_library')
                .select(`
                    id,
                    rating,
                    review,
                    book_id,
                    updated_at,
                    is_review_public,
                    dislike_reasons,
                    book:books (title, cover_url, authors)
                `)
                .eq('user_id', user.id)
                .not('rating', 'is', null)
                .order('updated_at', { ascending: false });

            if (reviewError) {
                console.error('Error fetching reviews:', reviewError);
            }

            if (reviewData) {
                const formattedReviews: JournalReview[] = reviewData.map((item: any) => ({
                    id: item.id,
                    rating: item.rating || 0,
                    review: item.review || '',
                    book_id: item.book_id,
                    book_title: item.book?.title || 'Unknown Book',
                    book_cover: item.book?.cover_url || '',
                    authors: item.book?.authors || [],
                    updated_at: item.updated_at,
                    is_public: item.is_review_public ?? true,
                    dislike_reasons: item.dislike_reasons || [],
                }));
                setReviews(formattedReviews);
            }
        } catch (error) {
            console.error('Error fetching journal data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEntry = async (id: string, type: 'note' | 'quote', newContent: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('book_notes')
            .update({ content: newContent })
            .eq('id', id);

        if (!error) {
            if (type === 'note') {
                setNotes(prev => prev.map(n => n.id === id ? { ...n, content: newContent } : n));
            } else {
                setQuotes(prev => prev.map(q => q.id === id ? { ...q, content: newContent } : q));
            }
        }
    };

    const handleUpdateReview = async (id: string, newContent: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('user_library')
            .update({ review: newContent })
            .eq('id', id);

        if (!error) {
            setReviews(prev => prev.map(r => r.id === id ? { ...r, review: newContent } : r));
        }
    };

    // Filter and Sort Data
    const getSortedData = <T extends { created_at?: string; updated_at?: string; book_title: string; rating?: number }>(data: T[]) => {
        let sorted = [...data];
        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.created_at || b.updated_at || '').getTime() - new Date(a.created_at || a.updated_at || '').getTime());
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.created_at || a.updated_at || '').getTime() - new Date(b.created_at || b.updated_at || '').getTime());
                break;
            case 'book':
                sorted.sort((a, b) => a.book_title.localeCompare(b.book_title));
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
        }
        return sorted;
    };

    const filteredNotes = getSortedData(notes).filter(n =>
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.book_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredQuotes = getSortedData(quotes).filter(q =>
        q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.book_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredReviews = getSortedData(reviews).filter(r =>
        r.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.book_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { key: 'notes' as TabType, label: 'Notes', icon: FileText, count: filteredNotes.length },
        { key: 'quotes' as TabType, label: 'Quotes', icon: Quote, count: filteredQuotes.length },
        { key: 'reviews' as TabType, label: 'Reviews & Ratings', icon: Star, count: filteredReviews.length },
    ];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6 p-4 md:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-display mb-2">Journal</h1>
                    <p className="text-slate-500 max-w-md">Your collection of thoughts, favorite quotes, and book reviews.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search journal..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-card border border-slate-200 dark:border-card-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative group">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="appearance-none w-full sm:w-40 px-4 py-2.5 bg-white dark:bg-card border border-slate-200 dark:border-card-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="book">By Book</option>
                            {activeTab === 'reviews' && <option value="rating">By Rating</option>}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap
                                ${isActive
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                    : 'bg-white dark:bg-slate-800/50 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content - Masonry Grid */}
            {loading ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="break-inside-avoid h-48 bg-card border border-card-border rounded-2xl animate-pulse mb-6" />
                    ))}
                </div>
            ) : (
                <div className="min-h-[500px]">
                    {activeTab === 'notes' && filteredNotes.length === 0 && (
                        <EmptyState icon={FileText} label="No notes yet" description="Start a reading session and add notes as you read" />
                    )}
                    {activeTab === 'quotes' && filteredQuotes.length === 0 && (
                        <EmptyState icon={Quote} label="No quotes saved" description="Save memorable quotes while reading" />
                    )}
                    {activeTab === 'reviews' && filteredReviews.length === 0 && (
                        <EmptyState icon={Star} label="No reviews yet" description="Rate and review books you've read" />
                    )}

                    {(filteredNotes.length > 0 || filteredQuotes.length > 0 || filteredReviews.length > 0) && (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            {activeTab === 'notes' && filteredNotes.map((note, i) => (
                                <NoteCard key={note.id} note={note} formatDate={formatDate} index={i} onUpdate={(c) => handleUpdateEntry(note.id, 'note', c)} />
                            ))}
                            {activeTab === 'quotes' && filteredQuotes.map((quote, i) => (
                                <QuoteCard key={quote.id} quote={quote} formatDate={formatDate} index={i} onUpdate={(c) => handleUpdateEntry(quote.id, 'quote', c)} />
                            ))}
                            {activeTab === 'reviews' && filteredReviews.map((review, i) => (
                                <ReviewCard key={review.id} review={review} formatDate={formatDate} index={i} onUpdate={(c) => handleUpdateReview(review.id, c)} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────

import { Edit2, Check, X } from 'lucide-react';

function EmptyState({ icon: Icon, label, description }: { icon: any; label: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 mb-6 ring-1 ring-slate-100 dark:ring-slate-700/50">
                <Icon className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{label}</h3>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
        </div>
    );
}

import { motion } from 'framer-motion';

function NoteCard({ note, formatDate, index, onUpdate }: { note: BookNote; formatDate: (d: string) => string; index: number; onUpdate: (content: string) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(note.content);

    const handleSave = () => {
        onUpdate(editContent);
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="break-inside-avoid mb-6 group relative"
        >
            <div className="p-6 bg-white dark:bg-[#1e1b2e] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-violet-900/10 hover:-translate-y-1 transition-all duration-300">

                {/* Header: Date & Page */}
                <div className="flex items-center justify-between mb-4 text-xs font-medium text-slate-400 tracking-wider uppercase">
                    <span>{formatDate(note.created_at)}</span>
                    <div className="flex items-center gap-2">
                        {note.page_number && <span>Page {note.page_number}</span>}

                        {/* Edit Button */}
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all">
                                <Edit2 className="w-3 h-3 text-slate-500" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1">
                                <button onClick={handleSave} className="p-1 hover:bg-emerald-50 text-emerald-500 rounded"><Check className="w-3 h-3" /></button>
                                <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-rose-50 text-rose-500 rounded"><X className="w-3 h-3" /></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {isEditing ? (
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-lg font-serif mb-4 focus:outline-none resize-none"
                        rows={5}
                        autoFocus
                    />
                ) : (
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-serif text-lg mb-6">
                        {note.content}
                    </p>
                )}

                {/* Footer: Book Info */}
                <Link href={`/book/${note.book_id}`} className="flex items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/50 group/book">
                    {note.book_cover && (
                        <img
                            src={note.book_cover}
                            alt={note.book_title}
                            className="w-8 h-12 rounded object-cover shadow-sm"
                        />
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate group-hover/book:text-primary-500 transition-colors">
                            {note.book_title}
                        </p>
                        {note.authors.length > 0 && (
                            <p className="text-xs text-slate-500 truncate">
                                {note.authors[0]}
                            </p>
                        )}
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}

function QuoteCard({ quote, formatDate, index, onUpdate }: { quote: BookNote; formatDate: (d: string) => string; index: number; onUpdate: (content: string) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(quote.content);

    const handleSave = () => {
        onUpdate(editContent);
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="break-inside-avoid mb-6 group"
        >
            <div className="relative p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-3xl border border-amber-100 dark:border-amber-500/10 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">

                {/* Decorative Quote Mark */}
                <Quote className="absolute top-4 left-4 w-12 h-12 text-amber-500/10" />

                <div className="relative z-10">
                    {/* Edit Button */}
                    <div className="absolute top-0 right-0">
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-amber-100/50 rounded-full transition-all">
                                <Edit2 className="w-3.5 h-3.5 text-amber-600/50" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1 bg-white/50 backdrop-blur rounded-lg p-1">
                                <button onClick={handleSave} className="p-1 hover:bg-emerald-50 text-emerald-500 rounded"><Check className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-rose-50 text-rose-500 rounded"><X className="w-3.5 h-3.5" /></button>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full text-xl md:text-2xl font-serif italic text-slate-800 dark:text-amber-50 bg-white/30 dark:bg-black/20 p-2 rounded-lg mb-6 focus:outline-none resize-none leading-relaxed"
                            rows={4}
                            autoFocus
                        />
                    ) : (
                        <p className="text-xl md:text-2xl font-serif italic text-slate-800 dark:text-amber-50 leading-relaxed mb-6">
                            "{quote.content}"
                        </p>
                    )}

                    <div className="flex items-center justify-between">
                        <Link href={`/book/${quote.book_id}`} className="flex items-center gap-2 group/book">
                            <div className="w-6 h-[1px] bg-amber-300 dark:bg-amber-700"></div>
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest truncate max-w-[150px] group-hover/book:text-amber-700">
                                {quote.book_title}
                            </p>
                        </Link>
                        {quote.page_number && (
                            <span className="text-xs font-medium text-amber-500/60 font-mono">
                                p.{quote.page_number}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ReviewCard({ review, formatDate, index, onUpdate }: { review: JournalReview; formatDate: (d: string) => string; index: number; onUpdate: (content: string) => void }) {
    const hasLongReview = review.review.length > 200;
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(review.review);

    const handleSave = () => {
        onUpdate(editContent);
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="break-inside-avoid mb-6 group"
        >
            <div className="bg-white dark:bg-[#1e1b2e] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-violet-900/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">

                {/* Edit Button */}
                <div className="absolute top-4 right-4 z-20">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    ) : (
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 shadow-sm rounded-lg p-1 border dark:border-slate-700">
                            <button onClick={handleSave} className="p-1 hover:bg-emerald-50 text-emerald-500 rounded"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-rose-50 text-rose-500 rounded"><X className="w-3.5 h-3.5" /></button>
                        </div>
                    )}
                </div>

                {/* Header with Book Cover Background Blur effect could be redundant here, let's keep it clean */}
                <div className="p-6">
                    <Link href={`/book/${review.book_id}`} className="flex gap-4 mb-4 group/book">
                        {review.book_cover && (
                            <div className="shrink-0 relative">
                                <img
                                    src={review.book_cover}
                                    alt={review.book_title}
                                    className="w-16 h-24 rounded-lg object-cover shadow-md group-hover/book:scale-105 transition-transform"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 rounded-full p-1 shadow-md">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 font-bold text-xs ring-1 ring-yellow-500/20">
                                        {review.rating}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="min-w-0 py-1">
                            <h3 className="font-bold text-lg text-foreground leading-tight mb-1 truncate group-hover/book:text-primary-500 transition-colors">
                                {review.book_title}
                            </h3>
                            <p className="text-sm text-slate-500 truncate mb-2">
                                {review.authors[0]}
                            </p>
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                                {getRatingLabel(review.rating)}
                            </span>
                        </div>
                    </Link>

                    {isEditing ? (
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-sm mb-4 focus:outline-none resize-none leading-relaxed"
                            rows={6}
                            autoFocus
                        />
                    ) : (
                        review.review && (
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 line-clamp-4">
                                {review.review}
                            </p>
                        )
                    )}

                    {/* Tags */}
                    {review.dislike_reasons && review.dislike_reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {review.dislike_reasons.map((reason) => (
                                <span key={reason} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wide">
                                    {reason}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 dark:border-slate-800/50 pt-3">
                        <span>{formatDate(review.updated_at)}</span>
                        <span className={review.is_public ? 'text-emerald-500' : 'text-slate-500'}>
                            {review.is_public ? 'Public' : 'Private'}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
