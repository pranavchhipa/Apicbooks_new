'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import BookCard from '@/components/BookCard';
import { BookOpen, Heart, CheckCircle, GraduationCap, Loader2, Library, Sparkles, Clock, Calendar, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { getUserLibrary, updateLibraryProgress, updateLibraryStatus, removeFromLibrary, type ReadingStatus } from '@/lib/api/library';
import { toast } from 'sonner';
import AddBookModal from '@/components/books/AddBookModal';
import ReviewModal from '@/components/books/ReviewModal';

export default function ShelvesPage() {
    const [activeTab, setActiveTab] = useState('reading');
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [reviewBook, setReviewBook] = useState<{ id: string, title: string } | null>(null);
    const supabase = createClient();
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) throw authError; // throwing here to be caught below
            if (!user || !isMounted.current) {
                setLoading(false);
                return;
            }

            let status: ReadingStatus | undefined;
            if (activeTab === 'reading') status = 'reading';
            else if (activeTab === 'want_to_read') status = 'wishlist';
            else if (activeTab === 'read') status = 'completed';

            if (activeTab === 'academic') {
                setBooks([]);
                setLoading(false);
                return;
            }

            const libraryItems = await getUserLibrary(user.id, status);

            if (isMounted.current) {
                setBooks(libraryItems || []);
            }
        } catch (error: any) {
            // Ignore AbortError and generic "signal is aborted" errors
            if (
                error?.name === 'AbortError' ||
                error?.message?.includes('aborted') ||
                error?.code === 'DOMException' // often AbortError is a DOMException
            ) {
                console.log("Fetch aborted via signal");
                return;
            }

            console.error("Failed to fetch shelves:", error);
            if (isMounted.current) {
                setError("Failed to load your books. Please check your connection.");
                toast.error("Failed to load your shelves");
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [activeTab]);

    const handleRemoveBook = async (bookId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Optimistic Update
        const previousBooks = [...books];
        setBooks(prev => prev.filter(b => b.book.id !== bookId));
        setUpdatingId(bookId);

        try {
            // 2. API Call
            await removeFromLibrary(user.id, bookId);
            toast.success("Book removed from library");
        } catch (error) {
            console.error("Failed to remove book:", error);
            // 3. Rollback
            setBooks(previousBooks);
            toast.error("Failed to remove book");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleStatusChange = async (bookId: string, newStatus: ReadingStatus) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Optimistic Update: Immediately remove from current view
        const previousBooks = [...books];
        setBooks(prev => prev.filter(b => b.book.id !== bookId));
        setUpdatingId(bookId);

        const statusLabel = newStatus === 'wishlist' ? 'Want to Read' : newStatus === 'completed' ? 'Finished' : 'Reading';
        toast.success(`Moved to ${statusLabel}`);

        // Trigger Review Modal if moving to 'completed'
        if (newStatus === 'completed') {
            const book = previousBooks.find(b => b.book.id === bookId);
            if (book) {
                // Determine title safely
                const title = book.book.title || 'Unknown Book';
                // Small timeout to allow the toast to be seen and UI to update
                setTimeout(() => {
                    setReviewBook({ id: bookId, title: title });
                }, 500);
            }
        }

        try {
            // 2. API Call
            await updateLibraryStatus(user.id, bookId, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
            // 3. Rollback on failure
            setBooks(previousBooks);
            toast.error("Failed to move book. Please try again.");
            setReviewBook(null); // Cancel review modal if status update failed
        } finally {
            setUpdatingId(null);
        }
    };

    // ... (keep handleProgressUpdate)

    const handleProgressUpdate = async (bookId: string, page: number, total: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic update
        setBooks(prev => prev.map(item => {
            if (item.book.id === bookId) {
                return { ...item, current_page: page };
            }
            return item;
        }));

        try {
            await updateLibraryProgress(user.id, bookId, page);
            if (total > 0 && page >= total) {
                // Auto-complete
                if (confirm("You've reached the end! Mark as finished?")) {
                    await handleStatusChange(bookId, 'completed');
                    toast.success("Congratulations on finishing the book!");
                }
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Failed to update progress");
        }
    };

    // ... (keep handleProgressUpdate)


    // ... (keep handleProgressUpdate)

    if (error && books.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in p-6">
                <div className="bg-rose-500/10 p-6 rounded-full mb-6 relative">
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping opacity-20" />
                    <Library className="w-12 h-12 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                <p className="text-slate-400 mb-8 text-center max-w-md">
                    We couldn't load your library. This is usually due to a temporary network issue.
                </p>
                <button
                    onClick={() => fetchBooks()}
                    className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (error && books.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in p-6">
                <div className="bg-rose-500/10 p-6 rounded-full mb-6 relative">
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping opacity-20" />
                    <Library className="w-12 h-12 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                <p className="text-slate-400 mb-8 text-center max-w-md">
                    We couldn't load your library. This is usually due to a temporary network issue.
                </p>
                <button
                    onClick={() => fetchBooks()}
                    className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Books</h1>
                    <p className="text-slate-400">Manage your collection and track your reading journey</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search library..."
                            className="bg-[#141b3d] border border-[#1e2749] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors w-64"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add Book
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-[#1e2749]">
                {[
                    { id: 'reading', label: 'Reading', icon: BookOpen },
                    { id: 'want_to_read', label: 'Want to Read', icon: Heart },
                    { id: 'read', label: 'Finished', icon: CheckCircle },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                : 'text-slate-400 hover:bg-[#1e2749] hover:text-white'
                            }
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-[#1e2749] rounded-2xl shimmer animate-pulse" />
                    ))}
                </div>
            ) : books.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in">
                    {books.map((item) => {
                        // Calculate percentage
                        let progressPercent = 0;
                        if (item.status === 'completed') {
                            progressPercent = 100;
                        } else if (item.current_page && item.book.page_count) {
                            progressPercent = Math.min(100, Math.round((item.current_page / item.book.page_count) * 100));
                        }

                        // Fix missing cover issue by mapping cover_url (DB) to coverUrl (Component)
                        const bookData = {
                            ...item.book,
                            coverUrl: item.book.cover_url || item.book.coverUrl,
                            prices: [] // Ensure prices array exists
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
                                    // Pass handleProgressUpdate ONLY for reading status, but the component handles the check too.
                                    onProgressUpdate={(page) => handleProgressUpdate(item.book.id, page, item.book.page_count || 0)}
                                    showPrices={false}
                                />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[40vh] py-12 text-center">
                    <div className="bg-[#141b3d] p-6 rounded-full mb-4">
                        <Library className="w-12 h-12 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Your shelf is empty</h3>
                    <p className="text-slate-400 max-w-sm mb-6">
                        {activeTab === 'reading' ? "You haven't started reading any books yet." :
                            activeTab === 'want_to_read' ? "Your wishlist is empty. Explore and save books for later!" :
                                "No finished books yet. Keep reading!"}
                    </p>
                    <Link href="/discover" className="btn-secondary px-6 py-2.5 rounded-xl font-medium">
                        Discover Books
                    </Link>
                </div>
            )}

            <AddBookModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onBookAdded={() => {
                    fetchBooks();
                }}
                currentTab={activeTab}
            />

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
