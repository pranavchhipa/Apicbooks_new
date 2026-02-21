'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import BookCard from '@/components/BookCard';
import { BookOpen, Heart, CheckCircle, GraduationCap, Loader2, Library, Sparkles, Clock, Calendar, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { getUserLibrary, updateLibraryProgress, updateLibraryStatus, removeFromLibrary, type ReadingStatus } from '@/lib/api/library';
import { getCollections, createCollection, deleteCollection, getCollectionDetails, removeBookFromCollection, type Collection, type CollectionItem } from '@/lib/api/collections';
import { toast } from 'sonner';
import AddBookModal from '@/components/books/AddBookModal';
import ReviewModal from '@/components/books/ReviewModal';
import CollectionCard from '@/components/collections/CollectionCard';
import CreateCollectionModal from '@/components/collections/CreateCollectionModal';
import CollectionDetails from '@/components/collections/CollectionDetails';
import MigrationHelper from '@/components/MigrationHelper';

export default function ShelvesPage() {
    const [activeTab, setActiveTab] = useState('reading');
    const [books, setBooks] = useState<any[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<{ details: Collection, items: CollectionItem[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
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

            if (authError) throw authError;
            if (!user || !isMounted.current) {
                setLoading(false);
                return;
            }

            if (activeTab === 'collections') {
                const userCollections = await getCollections(user.id);
                if (isMounted.current) {
                    setCollections(userCollections);
                }
            } else {
                let status: ReadingStatus | undefined;
                if (activeTab === 'reading') status = 'reading';
                else if (activeTab === 'want_to_read') status = 'wishlist';
                else if (activeTab === 'read') status = 'completed';

                const libraryItems = await getUserLibrary(user.id, status);

                if (isMounted.current) {
                    setBooks(libraryItems || []);
                }
            }
        } catch (error: any) {
            if (error?.name === 'AbortError') return;
            console.error("Failed to fetch data:", error);
            if (isMounted.current) {
                setError("Failed to load data. Please check your connection.");
                toast.error("Failed to load data");
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchBooks();
        // Reset selection when switching tabs
        if (activeTab !== 'collections') setSelectedCollection(null);
    }, [activeTab]);

    const handleRemoveBook = async (bookId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const previousBooks = [...books];
        setBooks(prev => prev.filter(b => b.book.id !== bookId));
        setUpdatingId(bookId);

        try {
            await removeFromLibrary(user.id, bookId);
            toast.success("Book removed from library");
        } catch (error) {
            console.error("Failed to remove book:", error);
            setBooks(previousBooks);
            toast.error("Failed to remove book");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleStatusChange = async (bookId: string, newStatus: ReadingStatus) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic UI Update
        const previousBooks = [...books];
        setBooks(prev => prev.filter(b => b.book.id !== bookId));
        setUpdatingId(bookId);

        const statusLabel = newStatus === 'wishlist' ? 'Want to Read' : newStatus === 'completed' ? 'Finished' : 'Reading';
        toast.success(`Moved to ${statusLabel}`);

        if (newStatus === 'completed') {
            const book = previousBooks.find(b => b.book.id === bookId);
            if (book) {
                const title = book.book.title || 'Unknown Book';
                setTimeout(() => {
                    setReviewBook({ id: bookId, title: title });
                }, 500);
            }
        }

        try {
            // Resolve UUID if needed
            let targetId = bookId;
            const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(bookId);

            if (!isUuid) {
                const { ensureBookExists } = await import('@/lib/api/library');
                const resolvedId = await ensureBookExists(bookId);
                if (resolvedId) targetId = resolvedId;
            }

            await updateLibraryStatus(user.id, targetId, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
            setBooks(previousBooks); // Revert on failure
            toast.error("Failed to move book. Please try again.");
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
                    toast.success("Congratulations on finishing the book!");
                }
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Failed to update progress");
        }
    };

    // Collection Handlers
    const handleCreateCollection = async (name: string, description: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await createCollection(user.id, name, description);
            toast.success("Collection created!");
            fetchBooks(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to create collection");
        }
    };

    const handleDeleteCollection = async (id: string) => {
        if (!confirm("Are you sure you want to delete this collection?")) return;
        try {
            await deleteCollection(id);
            setCollections(prev => prev.filter(c => c.id !== id));
            toast.success("Collection deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete collection");
        }
    };

    const handleOpenCollection = async (collection: Collection) => {
        setLoading(true);
        try {
            const details = await getCollectionDetails(collection.id);
            setSelectedCollection({ details: collection, items: details.items });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load collection details");
        } finally {
            setLoading(false);
        }
    };

    if (error && books.length === 0 && !loading && activeTab !== 'collections') {
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

    // Show migration helper if collections fail to load (likely missing table)
    if (activeTab === 'collections' && error && !loading) {
        return <MigrationHelper />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">My Books</h1>
                    <p className="text-slate-400">Manage your collection and track your reading journey</p>
                </div>
                <div className="flex items-center gap-3">
                    {activeTab !== 'collections' ? (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Add Book
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowCreateCollectionModal(true)}
                            className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            New Shelf
                        </button>
                    )}
                </div>
            </header>

            {/* Tabs */}
            {!selectedCollection && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-card-border">
                    {[
                        { id: 'reading', label: 'Reading', icon: BookOpen },
                        { id: 'want_to_read', label: 'Want to Read', icon: Heart },
                        { id: 'read', label: 'Finished', icon: CheckCircle },
                        { id: 'collections', label: 'Shelves', icon: Library },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                    : 'text-slate-400 hover:bg-elevated hover:text-white'
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            {selectedCollection ? (
                <CollectionDetails
                    items={selectedCollection.items}
                    collectionName={selectedCollection.details.name}
                    onBack={() => setSelectedCollection(null)}
                    onRemove={async (bookId) => {
                        try {
                            if (!selectedCollection) return;
                            // Optimistic remove for UI
                            setSelectedCollection(prev => prev ? ({ ...prev, items: prev.items.filter(i => i.book.id !== bookId) }) : null);
                            await removeBookFromCollection(selectedCollection.details.id, bookId);
                            toast.success("Book removed from collection");
                        } catch (error) {
                            console.error(error);
                            toast.error("Failed to remove book");
                        }
                    }}
                />
            ) : (
                <>
                    {activeTab === 'collections' ? (
                        loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-[3/4] bg-card/50 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : collections.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                                {collections.map(collection => (
                                    <CollectionCard
                                        key={collection.id}
                                        collection={collection}
                                        onDelete={handleDeleteCollection}
                                        onClick={() => handleOpenCollection(collection)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[40vh] py-12 text-center">
                                <div className="bg-[#141b3d] p-6 rounded-full mb-4">
                                    <Library className="w-12 h-12 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No shelves yet</h3>
                                <p className="text-slate-400 max-w-sm mb-6">
                                    Create your first shelf to organize your favorite books!
                                </p>
                                <button onClick={() => setShowCreateCollectionModal(true)} className="btn-secondary px-6 py-2.5 rounded-xl font-medium">
                                    Create Shelf
                                </button>
                            </div>
                        )
                    ) : (
                        loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="aspect-[2/3] bg-[#1e2749] rounded-2xl shimmer animate-pulse" />
                                ))}
                            </div>
                        ) : books.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in">
                                {books.map((item) => {
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
                                                userSeriesName={(Array.isArray(item.book.global_book_metadata) ? item.book.global_book_metadata[0]?.series_name : item.book.global_book_metadata?.series_name) || item.series_name || item.book.series_name}
                                                userSeriesOrder={(Array.isArray(item.book.global_book_metadata) ? item.book.global_book_metadata[0]?.series_order : item.book.global_book_metadata?.series_order) || item.series_order || item.book.series_order}
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
                        )
                    )}
                </>
            )}

            <AddBookModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onBookAdded={() => {
                    fetchBooks();
                }}
                currentTab={activeTab === 'collections' ? 'reading' : activeTab as any}
            />

            <CreateCollectionModal
                isOpen={showCreateCollectionModal}
                onClose={() => setShowCreateCollectionModal(false)}
                onCreate={handleCreateCollection}
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
