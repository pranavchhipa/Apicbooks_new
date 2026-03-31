'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import BookCard from '@/components/BookCard';
import {
    BookOpen, Heart, CheckCircle, XCircle, Loader2, Library, Plus,
    Search, ArrowUpDown, LayoutGrid, List, Flame, BookMarked, Star,
    ChevronDown, SortAsc
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getUserLibrary, updateLibraryProgress, updateLibraryStatus, removeFromLibrary, type ReadingStatus } from '@/lib/api/library';
import { toast } from 'sonner';
import AddBookModal from '@/components/books/AddBookModal';
import ReviewModal from '@/components/books/ReviewModal';

type ShelfTab = 'reading' | 'want_to_read' | 'read' | 'dnf';
type SortOption = 'recent' | 'title' | 'author' | 'rating';
type ViewMode = 'grid' | 'list';

const SHELF_TABS: { id: ShelfTab; label: string; icon: typeof BookOpen; emptyTitle: string; emptyMessage: string }[] = [
    {
        id: 'reading',
        label: 'Currently Reading',
        icon: BookOpen,
        emptyTitle: 'Nothing on your nightstand',
        emptyMessage: 'Start a new book and track your reading progress here. Every page counts!'
    },
    {
        id: 'want_to_read',
        label: 'Want to Read',
        icon: Heart,
        emptyTitle: 'Your wish list awaits',
        emptyMessage: 'Save books you want to read later. Browse our catalog to find your next great read.'
    },
    {
        id: 'read',
        label: 'Read',
        icon: CheckCircle,
        emptyTitle: 'Your reading journey starts here',
        emptyMessage: 'Books you have finished will appear here. Every completed book is a milestone.'
    },
    {
        id: 'dnf',
        label: 'Did Not Finish',
        icon: XCircle,
        emptyTitle: 'No abandoned books',
        emptyMessage: 'It is okay to put a book down. Not every book is right for every reader.'
    },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
    { id: 'recent', label: 'Recently Added' },
    { id: 'title', label: 'Title' },
    { id: 'author', label: 'Author' },
    { id: 'rating', label: 'Rating' },
];

export default function MyBooksPage() {
    const [activeTab, setActiveTab] = useState<ShelfTab>('reading');
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [reviewBook, setReviewBook] = useState<{ id: string; title: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [allBooks, setAllBooks] = useState<any[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);

    const supabase = createClient();
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Fetch all books for stats
    useEffect(() => {
        const fetchAllBooks = async () => {
            setStatsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const items = await getUserLibrary(user.id);
                if (isMounted.current) {
                    setAllBooks(items || []);
                }
            } catch (err) {
                console.error('Failed to fetch all books for stats:', err);
            } finally {
                if (isMounted.current) setStatsLoading(false);
            }
        };
        fetchAllBooks();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError) throw authError;
            if (!user || !isMounted.current) { setLoading(false); return; }

            let status: ReadingStatus | undefined;
            if (activeTab === 'reading') status = 'reading';
            else if (activeTab === 'want_to_read') status = 'wishlist';
            else if (activeTab === 'read') status = 'completed';

            // DNF tab - for now show empty since there's no 'dnf' status in DB
            if (activeTab === 'dnf') {
                setBooks([]);
                setLoading(false);
                return;
            }

            const libraryItems = await getUserLibrary(user.id, status);
            if (isMounted.current) {
                setBooks(libraryItems || []);
            }
        } catch (error: any) {
            if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
            console.error('Failed to fetch shelves:', error);
            if (isMounted.current) {
                setError('Failed to load your books. Please check your connection.');
                toast.error('Failed to load your shelves');
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    useEffect(() => { fetchBooks(); }, [activeTab]);

    // Computed stats
    const stats = useMemo(() => {
        const totalBooks = allBooks.length;
        const totalPages = allBooks.reduce((sum, item) => {
            if (item.status === 'completed' && item.book?.page_count) {
                return sum + item.book.page_count;
            }
            if (item.status === 'reading' && item.current_page) {
                return sum + item.current_page;
            }
            return sum;
        }, 0);
        return { totalBooks, totalPages, currentStreak: 0 };
    }, [allBooks]);

    // Filter and sort books
    const filteredBooks = useMemo(() => {
        let result = [...books];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.book?.title?.toLowerCase().includes(q) ||
                item.book?.authors?.some((a: string) => a.toLowerCase().includes(q))
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return (a.book?.title || '').localeCompare(b.book?.title || '');
                case 'author':
                    return (a.book?.authors?.[0] || '').localeCompare(b.book?.authors?.[0] || '');
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'recent':
                default:
                    return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
            }
        });

        return result;
    }, [books, searchQuery, sortBy]);

    const handleRemoveBook = async (bookId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const previousBooks = [...books];
        setBooks(prev => prev.filter(b => b.book.id !== bookId));
        setUpdatingId(bookId);

        try {
            await removeFromLibrary(user.id, bookId);
            toast.success('Book removed from library');
            // Update allBooks too
            setAllBooks(prev => prev.filter(b => b.book?.id !== bookId));
        } catch (error) {
            console.error('Failed to remove book:', error);
            setBooks(previousBooks);
            toast.error('Failed to remove book');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleStatusChange = async (bookId: string, newStatus: ReadingStatus) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const previousBooks = [...books];
        setBooks(prev => prev.filter(b => b.book.id !== bookId));
        setUpdatingId(bookId);

        const statusLabel = newStatus === 'wishlist' ? 'Want to Read' : newStatus === 'completed' ? 'Finished' : 'Reading';
        toast.success(`Moved to ${statusLabel}`);

        if (newStatus === 'completed') {
            const book = previousBooks.find(b => b.book.id === bookId);
            if (book) {
                const title = book.book.title || 'Unknown Book';
                setTimeout(() => { setReviewBook({ id: bookId, title }); }, 500);
            }
        }

        try {
            await updateLibraryStatus(user.id, bookId, newStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
            setBooks(previousBooks);
            toast.error('Failed to move book. Please try again.');
            setReviewBook(null);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleProgressUpdate = async (bookId: string, page: number, total: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setBooks(prev => prev.map(item => {
            if (item.book.id === bookId) {
                return { ...item, current_page: page };
            }
            return item;
        }));

        try {
            await updateLibraryProgress(user.id, bookId, page);
            if (total > 0 && page >= total) {
                if (confirm("You've reached the end! Mark as finished?")) {
                    await handleStatusChange(bookId, 'completed');
                    toast.success('Congratulations on finishing the book!');
                }
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
            toast.error('Failed to update progress');
        }
    };

    const currentTab = SHELF_TABS.find(t => t.id === activeTab)!;

    if (error && books.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in p-6">
                <div className="bg-rose-500/10 p-6 rounded-full mb-6 relative">
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping opacity-20" />
                    <Library className="w-12 h-12 text-rose-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Something went wrong</h3>
                <p className="text-white/40 mb-8 text-center max-w-md">
                    We could not load your library. This is usually due to a temporary network issue.
                </p>
                <button
                    onClick={() => fetchBooks()}
                    className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 px-4 sm:px-6">
            {/* Page Header */}
            <header>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                    My Library
                </h1>
                <p className="text-white/40 font-sans">
                    Manage your collection and track your reading journey
                </p>
            </header>

            {/* Reading Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex items-center gap-4 p-4 sm:p-5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 shrink-0">
                        <BookMarked className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white font-display">
                            {statsLoading ? '-' : stats.totalBooks}
                        </p>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Total Books</p>
                    </div>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex items-center gap-4 p-4 sm:p-5">
                    <div className="p-2.5 rounded-xl bg-violet-500/10 shrink-0">
                        <BookOpen className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white font-display">
                            {statsLoading ? '-' : stats.totalPages.toLocaleString()}
                        </p>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Pages Read</p>
                    </div>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex items-center gap-4 p-4 sm:p-5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 shrink-0">
                        <Flame className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white font-display">
                            {statsLoading ? '-' : stats.currentStreak}
                        </p>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Day Streak</p>
                    </div>
                </div>
            </div>

            {/* Controls Bar: Tabs + Actions */}
            <div className="space-y-4">
                {/* Shelf Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {SHELF_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-4 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold transition-all whitespace-nowrap border
                                ${activeTab === tab.id
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'text-white/40 border-white/[0.06] hover:text-white hover:border-white/[0.12]'
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && books.length > 0 && !loading && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-xs">
                                    {filteredBooks.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search, Sort, View, Add */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search your library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-10 pr-4 py-2.5 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                onBlur={() => setTimeout(() => setShowSortDropdown(false), 200)}
                                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white hover:bg-white/[0.06] transition-colors"
                            >
                                <SortAsc className="w-4 h-4 text-white/30" />
                                <span className="hidden sm:inline">{SORT_OPTIONS.find(s => s.id === sortBy)?.label}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                            </button>

                            {showSortDropdown && (
                                <div className="absolute top-full left-0 mt-1 w-44 bg-surface border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-down">
                                    {SORT_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setSortBy(option.id);
                                                setShowSortDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                                                ${sortBy === option.id
                                                    ? 'bg-amber-500/10 text-amber-400 font-semibold'
                                                    : 'text-white/60 hover:bg-white/[0.03]'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 transition-colors ${viewMode === 'grid'
                                    ? 'bg-amber-500 text-black'
                                    : 'text-white/30 hover:text-white'
                                }`}
                                title="Grid view"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 transition-colors ${viewMode === 'list'
                                    ? 'bg-amber-500 text-black'
                                    : 'text-white/30 hover:text-white'
                                }`}
                                title="List view"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add Book Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 text-sm shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Book</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-[2/3] bg-white/[0.06] rounded-2xl animate-pulse" />
                                <div className="space-y-2 px-1">
                                    <div className="h-4 w-3/4 bg-white/[0.06] rounded animate-pulse" />
                                    <div className="h-3 w-1/2 bg-white/[0.03] rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex items-center gap-4 p-4 animate-pulse">
                                <div className="w-14 h-20 bg-white/[0.06] rounded-lg shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/3 bg-white/[0.06] rounded" />
                                    <div className="h-3 w-1/4 bg-white/[0.03] rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : filteredBooks.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 animate-fade-in">
                        {filteredBooks.map((item) => {
                            let progressPercent = 0;
                            if (item.status === 'completed') {
                                progressPercent = 100;
                            } else if (item.current_page && item.book.page_count) {
                                progressPercent = Math.min(100, Math.round((item.current_page / item.book.page_count) * 100));
                            }

                            const bookData = {
                                ...item.book,
                                coverUrl: item.book.cover_url || item.book.coverUrl,
                                prices: []
                            };

                            return (
                                <div key={item.book.id} className="h-full">
                                    <BookCard
                                        book={bookData}
                                        readingStatus={item.status}
                                        progress={progressPercent}
                                        userRating={item.rating}
                                        onStatusChange={(status) => handleStatusChange(item.book.id, status)}
                                        onRemove={() => handleRemoveBook(item.book.id)}
                                        onProgressUpdate={(page) => handleProgressUpdate(item.book.id, page, item.book.page_count || 0)}
                                        showPrices={false}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-3 animate-fade-in">
                        {filteredBooks.map((item) => {
                            let progressPercent = 0;
                            if (item.status === 'completed') {
                                progressPercent = 100;
                            } else if (item.current_page && item.book.page_count) {
                                progressPercent = Math.min(100, Math.round((item.current_page / item.book.page_count) * 100));
                            }

                            return (
                                <Link
                                    key={item.book.id}
                                    href={`/book/${item.book.id}`}
                                    className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex items-center gap-4 p-4 hover:border-white/[0.12] transition-all duration-200 group"
                                >
                                    {/* Cover Thumbnail */}
                                    <div className="relative w-14 h-20 rounded-lg overflow-hidden bg-white/[0.06] shrink-0 shadow-book">
                                        {(item.book.cover_url || item.book.coverUrl) ? (
                                            <Image
                                                src={item.book.cover_url || item.book.coverUrl}
                                                alt={item.book.title}
                                                fill
                                                className="object-cover"
                                                sizes="56px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-white/20" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Book Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                                            {item.book.title}
                                        </h3>
                                        <p className="text-sm text-white/40 truncate">
                                            {item.book.authors?.join(', ') || 'Unknown Author'}
                                        </p>

                                        {/* Progress bar for reading books */}
                                        {item.status === 'reading' && progressPercent > 0 && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-white/30 font-medium shrink-0">
                                                    {progressPercent}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    <div className="hidden sm:flex items-center gap-1 text-sm shrink-0">
                                        {item.rating ? (
                                            <>
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="font-semibold text-white">{item.rating}</span>
                                            </>
                                        ) : (
                                            <span className="text-white/30 text-xs">Not rated</span>
                                        )}
                                    </div>

                                    {/* Page count */}
                                    <div className="hidden md:block text-xs text-white/30 shrink-0">
                                        {item.book.page_count ? `${item.book.page_count} pages` : ''}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center min-h-[40vh] py-16 text-center">
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-8 rounded-full mb-6">
                        <currentTab.icon className="w-14 h-14 text-white/20" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-2">
                        {searchQuery ? 'No books found' : currentTab.emptyTitle}
                    </h3>
                    <p className="text-white/40 max-w-sm mb-8 leading-relaxed">
                        {searchQuery
                            ? `No books matching "${searchQuery}" in this shelf. Try a different search or check another shelf.`
                            : currentTab.emptyMessage
                        }
                    </p>
                    <div className="flex items-center gap-3">
                        <Link href="/discover" className="px-5 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/60 hover:text-white hover:border-white/[0.12] transition-all font-medium text-sm">
                            Discover Books
                        </Link>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-5 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors text-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Manually
                        </button>
                    </div>
                </div>
            )}

            {/* Add Book Modal */}
            <AddBookModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onBookAdded={() => {
                    fetchBooks();
                    // Refresh all books for stats
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user) getUserLibrary(user.id).then(items => setAllBooks(items || []));
                    });
                }}
                currentTab={activeTab === 'want_to_read' ? 'want_to_read' : activeTab === 'read' ? 'read' : 'reading'}
            />

            {/* Review Modal */}
            {reviewBook && (
                <ReviewModal
                    isOpen={true}
                    onClose={() => setReviewBook(null)}
                    bookId={reviewBook.id}
                    bookTitle={reviewBook.title}
                    onReviewSubmitted={() => {
                        fetchBooks();
                        setReviewBook(null);
                    }}
                />
            )}
        </div>
    );
}
