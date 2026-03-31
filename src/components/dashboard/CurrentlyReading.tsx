'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle, PauseCircle, Save, BookOpen, Clock, Library, ChevronDown, Calendar, TrendingUp, Target, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import {
    startReadingSession,
    endReadingSession,
    getActiveSession,
    updateLibraryProgress,

    ensureBookStarted,
    updateBookStartedDate,
    type ReadingSession
} from '@/lib/api/library';
import { toast } from 'sonner';
import NotesQuotesPanel from '@/components/books/NotesQuotesPanel';

// Local storage key for timer state
const TIMER_STATE_KEY = 'apicbooks_active_timer';

interface TimerState {
    sessionId: string;
    libraryId: string;
    startedAt: string;
    bookTitle: string;
}

import ReviewModal from '@/components/books/ReviewModal';

export default function CurrentlyReading() {
    // ... (existing state)
    const [books, setBooks] = useState<any[]>([]);
    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [activeSession, setActiveSession] = useState<ReadingSession | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [newPage, setNewPage] = useState<number | string>('');
    const [showEndModal, setShowEndModal] = useState(false);
    const [showBookSelector, setShowBookSelector] = useState(false);
    const [sessionNotes, setSessionNotes] = useState('');
    const [reviewBook, setReviewBook] = useState<{ bookId: string, title: string, libraryId: string } | null>(null);
    const [isEditingDate, setIsEditingDate] = useState(false);

    const supabase = createClient();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load books and restore timer state
    useEffect(() => {
        const initialize = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch all reading books
            const { data } = await supabase
                .from('user_library')
                .select(`
                    *,
                    book:books (title, authors, cover_url, page_count)
                `)
                .eq('user_id', user.id)
                .eq('status', 'reading')
                .order('updated_at', { ascending: false });

            if (data && data.length > 0) {
                const formattedBooks = data.map(item => ({
                    ...item,
                    id: item.id,
                    book_id: item.book_id,
                    title: item.book.title,
                    author: item.book.authors?.[0] || 'Unknown',
                    cover_url: item.book.cover_url,
                    total_pages: item.book.page_count || 0,
                    current_page: item.current_page || 0,
                    total_minutes_read: item.total_minutes_read || 0,
                    started_at: item.started_at
                }));
                setBooks(formattedBooks);

                // Restore timer state from localStorage
                const savedState = localStorage.getItem(TIMER_STATE_KEY);
                if (savedState) {
                    try {
                        const timerState: TimerState = JSON.parse(savedState);
                        // Verify session still exists
                        const session = await getActiveSession(user.id);
                        if (session && session.id === timerState.sessionId) {
                            // Calculate elapsed time
                            const elapsed = Math.floor((Date.now() - new Date(timerState.startedAt).getTime()) / 1000);
                            setSeconds(elapsed);
                            setIsTimerRunning(true);
                            setActiveSession(session);
                            // Select the book being timed
                            const book = formattedBooks.find(b => b.id === timerState.libraryId);
                            if (book) {
                                setSelectedBook(book);
                                setNewPage(book.current_page);
                            }
                        } else {
                            // Clear stale timer state
                            localStorage.removeItem(TIMER_STATE_KEY);
                        }
                    } catch (e) {
                        localStorage.removeItem(TIMER_STATE_KEY);
                    }
                }

                // Select most recent book if not already selected
                if (!selectedBook) {
                    setSelectedBook(formattedBooks[0]);
                    setNewPage(formattedBooks[0].current_page);
                }
            }
            setLoading(false);
        };
        initialize();
    }, []);

    // Timer interval
    useEffect(() => {
        if (isTimerRunning && !showEndModal) {
            intervalRef.current = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isTimerRunning, showEndModal]);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatMinutes = (totalMinutes: number) => {
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    const handleStartSession = async () => {
        if (!selectedBook) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Ensure book has a started_at date (for stats)
        const startedAt = await ensureBookStarted(user.id, selectedBook.id);
        if (startedAt && !selectedBook.started_at) {
            // Update local state immediately so stats appear
            setSelectedBook((prev: any) => ({ ...prev, started_at: startedAt }));
            setBooks(prev => prev.map(b => b.id === selectedBook.id ? { ...b, started_at: startedAt } : b));
        }

        const session = await startReadingSession(user.id, selectedBook.id, selectedBook.current_page);
        if (session) {
            setActiveSession(session);
            setIsTimerRunning(true);
            setSeconds(0);

            // Save to localStorage for persistence
            const timerState: TimerState = {
                sessionId: session.id,
                libraryId: selectedBook.id,
                startedAt: session.started_at,
                bookTitle: selectedBook.title
            };
            localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(timerState));

            toast.success('Reading session started!', {
                description: `Timer running for "${selectedBook.title}"`
            });
        }
    };

    const handleStopSession = () => {
        setShowEndModal(true);
    };

    const handleSaveSession = async () => {
        if (!selectedBook) return;
        setIsSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsSaving(false);
            return;
        }

        let pageNum = parseInt(newPage.toString()) || selectedBook.current_page;
        if (selectedBook.total_pages > 0) {
            pageNum = Math.min(pageNum, selectedBook.total_pages);
        }
        const isFinished = selectedBook.total_pages > 0 && pageNum >= selectedBook.total_pages;

        // End the session if one is active
        if (activeSession) {
            await endReadingSession(activeSession.id, pageNum, sessionNotes);
        }

        // Update progress (and status if finished)
        await updateLibraryProgress(
            user.id,
            selectedBook.book_id,
            pageNum,
            isFinished ? 'completed' : undefined
        );

        if (isFinished) {
            import('canvas-confetti').then((confetti) => {
                confetti.default({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            });
            toast.success('🎉 Congratulations! You finished the book!');

            // Trigger review modal after a delay
            setTimeout(() => {
                setReviewBook({
                    bookId: selectedBook.book_id,
                    title: selectedBook.title,
                    libraryId: selectedBook.id
                });
            }, 1000);
        } else {
            const pagesRead = pageNum - selectedBook.current_page;
            const timeSpent = seconds > 0 ? formatMinutes(Math.ceil(seconds / 60)) : null;
            toast.success('Progress saved!', {
                description: `Updated to page ${pageNum}${pagesRead > 0 ? ` (+${pagesRead} pages)` : ''}${timeSpent ? ` in ${timeSpent}` : ''}`
            });

            // Update local state
            setSelectedBook((prev: any) => ({ ...prev, current_page: pageNum }));
            setBooks(prev => prev.map(b =>
                b.id === selectedBook.id
                    ? {
                        ...b,
                        current_page: pageNum,
                        total_minutes_read: (b.total_minutes_read || 0) + Math.ceil(seconds / 60)
                    }
                    : b
            ));
        }

        // Clear timer state if running
        if (isTimerRunning) {
            localStorage.removeItem(TIMER_STATE_KEY);
            setIsTimerRunning(false);
            setSeconds(0);
            setActiveSession(null);
            setSessionNotes('');
        }

        setShowEndModal(false);
        setIsSaving(false);
    };

    const handleReviewComplete = () => {
        if (reviewBook) {
            // Remove the finished book from local state
            setBooks(prev => {
                const newBooks = prev.filter(b => b.id !== reviewBook.libraryId);
                // If the removed book was selected, select the next one or null
                if (selectedBook?.id === reviewBook.libraryId) {
                    setSelectedBook(newBooks.length > 0 ? newBooks[0] : null);
                    if (newBooks.length > 0) setNewPage(newBooks[0].current_page);
                }
                return newBooks;
            });
            setReviewBook(null);
        }
    };



    const handleDiscardSession = async () => {
        if (activeSession) {
            const supabase = createClient();
            await supabase.from('reading_sessions').delete().eq('id', activeSession.id);
        }
        localStorage.removeItem(TIMER_STATE_KEY);
        setIsTimerRunning(false);
        setSeconds(0);
        setActiveSession(null);
        setShowEndModal(false);
        setSessionNotes('');
        toast.info('Session discarded');
    };

    const selectBook = (book: any) => {
        if (isTimerRunning) {
            toast.error('Please stop the current session before switching books');
            return;
        }
        setSelectedBook(book);
        setNewPage(book.current_page);
        setShowBookSelector(false);
    };

    if (loading) {
        return (
            <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl overflow-hidden p-6 md:p-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-8 border-b border-card-border/50 pb-4">
                    <div className="h-6 w-40 bg-card-border rounded-lg" />
                    <div className="h-8 w-32 bg-card-border rounded-lg" />
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Book Cover Skeleton */}
                    <div className="flex flex-col items-center lg:items-start gap-4">
                        <div className="w-32 h-48 bg-card-border rounded-lg shadow-xl" />
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-6">
                        {/* Title & Author */}
                        <div className="space-y-3">
                            <div className="h-8 w-3/4 bg-card-border rounded-lg" />
                            <div className="h-5 w-1/3 bg-card-border rounded-lg" />
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <div className="h-4 w-20 bg-card-border rounded" />
                                <div className="h-4 w-20 bg-card-border rounded" />
                            </div>
                            <div className="h-2.5 w-full bg-card-border rounded-full" />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-24 bg-card-border rounded-xl" />
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <div className="h-12 flex-1 bg-card-border rounded-xl" />
                            <div className="h-12 w-32 bg-card-border rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Empty State
    if (!selectedBook) {
        return (
            <div className="bg-card backdrop-blur-xl border border-card-border rounded-2xl p-16">
                <div className="max-w-lg mx-auto text-center">
                    <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur-2xl opacity-30" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl border border-primary-500/30 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-primary-400" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">No Active Book</h2>
                    <p className="text-muted-foreground mb-8 text-lg">
                        Start reading a book to track your progress and see your stats come to life.
                    </p>
                    <Link
                        href="/my-books"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-primary-500/30 transition-all hover:scale-105"
                    >
                        <Library className="w-5 h-5" />
                        Browse Library
                    </Link>
                </div>
            </div>
        );
    }

    const percentage = selectedBook.total_pages > 0
        ? Math.min(100, Math.round((selectedBook.current_page / selectedBook.total_pages) * 100))
        : 0;

    // Use created_at as fallback if started_at is missing (common for imported/older books)
    const startDate = selectedBook.started_at || selectedBook.created_at || new Date().toISOString();

    // Calculate days active (min 1 day)
    const daysActive = Math.max(1, Math.ceil((Date.now() - new Date(startDate).getTime()) / 86400000));

    const pagesPerDay = Math.round(selectedBook.current_page / daysActive);

    const estimatedDaysLeft = pagesPerDay > 0
        ? Math.ceil(Math.max(0, selectedBook.total_pages - selectedBook.current_page) / pagesPerDay)
        : null;

    return (
        <>
            <div className="relative bg-card backdrop-blur-xl border border-card-border rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10">
                {/* Header with Navigation */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-card-border/50">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary-400" />
                        <h2 className="font-semibold text-foreground">Currently Reading</h2>
                        {books.length > 1 && (
                            <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 text-xs font-medium border border-primary-500/20">
                                {books.length} Active
                            </span>
                        )}
                    </div>

                    {books.length > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    if (isTimerRunning) {
                                        toast.error('Stop timer to switch books');
                                        return;
                                    }
                                    const currentIndex = books.findIndex(b => b.id === selectedBook?.id);
                                    const prevIndex = (currentIndex - 1 + books.length) % books.length;
                                    selectBook(books[prevIndex]);
                                }}
                                disabled={isTimerRunning}
                                className="p-1.5 rounded-lg hover:bg-elevated text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                                title="Previous Book"
                            >
                                <ChevronDown className="w-5 h-5 rotate-90" />
                            </button>
                            <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                                {(books.findIndex(b => b.id === selectedBook?.id) + 1)} / {books.length}
                            </span>
                            <button
                                onClick={() => {
                                    if (isTimerRunning) {
                                        toast.error('Stop timer to switch books');
                                        return;
                                    }
                                    const currentIndex = books.findIndex(b => b.id === selectedBook?.id);
                                    const nextIndex = (currentIndex + 1) % books.length;
                                    selectBook(books[nextIndex]);
                                }}
                                disabled={isTimerRunning}
                                className="p-1.5 rounded-lg hover:bg-elevated text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                                title="Next Book"
                            >
                                <ChevronDown className="w-5 h-5 -rotate-90" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left: Book Cover & Quick Stats */}
                        <div className="flex flex-col items-center lg:items-start gap-4">
                            {/* Book Cover */}
                            <div className="relative w-32 h-48 rounded-lg shadow-2xl overflow-hidden group">
                                {selectedBook.cover_url ? (
                                    <Image
                                        src={selectedBook.cover_url}
                                        alt={selectedBook.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                        <BookOpen className="w-12 h-12 text-primary-400" />
                                    </div>
                                )}
                                {/* Progress overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                    <div className="text-center">
                                        <span className="text-2xl font-bold text-foreground">{percentage}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Book Info & Controls */}
                        <div className="flex-1 space-y-6">
                            {/* Title & Timer */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground leading-tight mb-1">
                                        {selectedBook.title}
                                    </h3>
                                    <p className="text-muted-foreground">by {selectedBook.author}</p>
                                </div>

                                {/* Timer Display */}
                                <div className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl border transition-all
                                    ${isTimerRunning
                                        ? 'bg-primary-500/10 border-primary-500/30 shadow-lg shadow-primary-500/20'
                                        : 'bg-elevated/50 border-card-border'}
                                `}>
                                    <Clock className={`w-4 h-4 ${isTimerRunning ? 'text-primary-400 animate-pulse' : 'text-muted-foreground'}`} />
                                    <span className={`text-xl font-mono font-bold tabular-nums ${isTimerRunning ? 'text-foreground' : 'text-foreground/80'}`}>
                                        {formatTime(seconds)}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Page {Math.min(selectedBook.current_page, selectedBook.total_pages)} of {selectedBook.total_pages}</span>
                                    <span className="text-primary-400 font-medium">{selectedBook.total_pages - selectedBook.current_page} pages left</span>
                                </div>
                                <div className="h-2.5 w-full bg-[#0a0e27] rounded-full overflow-hidden border border-card-border">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-secondary dark:bg-[#0c0a14]/50 border border-card-border rounded-xl p-3 text-center">
                                    <Clock className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-foreground">{formatMinutes(selectedBook.total_minutes_read || 0)}</p>
                                    <p className="text-xs text-slate-500">Time Read</p>
                                </div>
                                <div className="bg-secondary dark:bg-[#0c0a14]/50 border border-card-border rounded-xl p-3 text-center">
                                    <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-foreground">{pagesPerDay}</p>
                                    <p className="text-xs text-slate-500">Pages/Day</p>
                                </div>

                                <div
                                    className={`
                                        bg-secondary dark:bg-[#0c0a14]/50 border border-card-border rounded-xl p-3 text-center
                                        ${!isEditingDate ? 'cursor-pointer hover:border-amber-400/50 hover:bg-amber-400/5 group/date' : ''}
                                        transition-all relative
                                    `}
                                    onClick={() => !isEditingDate && setIsEditingDate(true)}
                                    title="Click to edit start date"
                                >
                                    <Calendar className="w-4 h-4 text-amber-400 mx-auto mb-1" />

                                    {isEditingDate ? (
                                        <input
                                            type="date"
                                            className="w-full bg-transparent text-sm font-bold text-foreground text-center outline-none border-b border-amber-400"
                                            value={new Date(startDate).toISOString().split('T')[0]}
                                            onChange={async (e) => {
                                                const newDate = e.target.value;
                                                if (newDate) {
                                                    try {
                                                        const { data: { user } } = await supabase.auth.getUser();
                                                        if (user && selectedBook) {
                                                            await updateBookStartedDate(user.id, selectedBook.id, new Date(newDate).toISOString());
                                                            // Update local state
                                                            setSelectedBook((prev: any) => ({ ...prev, started_at: new Date(newDate).toISOString() }));
                                                            setBooks(prev => prev.map(b => b.id === selectedBook.id ? { ...b, started_at: new Date(newDate).toISOString() } : b));
                                                            toast.success('Start date updated');
                                                        }
                                                    } catch (error) {
                                                        toast.error('Failed to update date');
                                                    }
                                                }
                                                setIsEditingDate(false);
                                            }}
                                            onBlur={() => setIsEditingDate(false)}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <>
                                            <p className="text-lg font-bold text-foreground relative z-10">
                                                {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/date:opacity-10 pointer-events-none">
                                                <div className="bg-amber-400 w-full h-full rounded-xl" />
                                            </div>
                                        </>
                                    )}
                                    <p className="text-xs text-slate-500">Started</p>
                                </div>
                                <div className="bg-secondary dark:bg-[#0c0a14]/50 border border-card-border rounded-xl p-3 text-center">
                                    <Target className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-foreground">
                                        {estimatedDaysLeft ? `${estimatedDaysLeft}d` : '—'}
                                    </p>
                                    <p className="text-xs text-slate-500">Est. Finish</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                {!isTimerRunning ? (
                                    <button
                                        onClick={handleStartSession}
                                        className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                                    >
                                        <PlayCircle className="w-5 h-5" />
                                        Start Reading Session
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStopSession}
                                        className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 rounded-xl font-semibold transition-all"
                                    >
                                        <PauseCircle className="w-5 h-5" />
                                        Stop & Save Session
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowEndModal(true)}
                                    className="flex items-center gap-2 px-4 py-3 border border-card-border hover:bg-card-border rounded-xl text-foreground/80 transition-all"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Update Page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes & Quotes Section */}
                {selectedBook && (
                    <div className="mt-4">
                        <NotesQuotesPanel
                            libraryId={selectedBook.id}
                            bookTitle={selectedBook.title}
                            currentPage={selectedBook.current_page}
                        />
                    </div>
                )}
            </div >

            {/* End Session Modal */}
            {
                showEndModal && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-start justify-center p-4 pt-24 overflow-y-auto">
                        <div className="bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl relative mb-12">
                            <div className="flex items-center justify-between p-6 border-b border-card-border">
                                <h3 className="text-lg font-bold text-foreground">
                                    {isTimerRunning ? 'End Reading Session' : 'Update Progress'}
                                </h3>
                                <button
                                    onClick={() => setShowEndModal(false)}
                                    className="p-2 hover:bg-card-border rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {isTimerRunning && (
                                    <div className="text-center p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">Session Duration</p>
                                        <p className="text-3xl font-mono font-bold text-foreground">{formatTime(seconds)}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm text-muted-foreground mb-2">
                                        Current Page (out of {selectedBook.total_pages})
                                    </label>
                                    <input
                                        type="number"
                                        value={newPage}
                                        onChange={(e) => setNewPage(e.target.value)}
                                        placeholder={selectedBook.current_page.toString()}
                                        min={0}
                                        max={selectedBook.total_pages}
                                        className="w-full px-4 py-3 bg-secondary dark:bg-[#0c0a14] border border-card-border rounded-xl text-foreground focus:border-primary-500 outline-none transition-colors"
                                    />
                                </div>

                                {isTimerRunning && (
                                    <div className="mt-4">
                                        <label className="block text-xs font-medium text-muted-foreground mb-2 text-center">Session Vibe</label>
                                        <div className="flex justify-center gap-3">
                                            {[
                                                { emoji: '🔥', label: 'Focused' },
                                                { emoji: '😊', label: 'Relaxed' },
                                                { emoji: '🤔', label: 'Reflective' },
                                                { emoji: '😴', label: 'Sleepy' },
                                            ].map(mood => (
                                                <button
                                                    key={mood.label}
                                                    type="button"
                                                    onClick={() => setSessionNotes(sessionNotes === mood.label ? '' : mood.label)}
                                                    className={`
                                                    relative group w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all
                                                    ${sessionNotes === mood.label
                                                            ? 'bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/25'
                                                            : 'bg-secondary dark:bg-[#1a1528] text-slate-400 hover:bg-elevated hover:scale-105'}
                                                `}
                                                    title={mood.label}
                                                >
                                                    {mood.emoji}
                                                    {/* Tooltip label */}
                                                    <span className={`
                                                    absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-medium
                                                    ${sessionNotes === mood.label ? 'text-primary-400 opacity-100' : 'text-slate-500'}
                                                `}>
                                                        {mood.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        {/* Spacer for labels */}
                                        <div className="h-4" />
                                    </div>
                                )}

                                {/* Notes & Quotes — with their own page numbers */}
                                {selectedBook && (
                                    <div className="border-t border-card-border pt-4">
                                        <NotesQuotesPanel
                                            libraryId={selectedBook.id}
                                            bookTitle={selectedBook.title}
                                            currentPage={parseInt(newPage.toString()) || selectedBook.current_page}
                                            compact={true}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 p-6 border-t border-card-border">
                                {isTimerRunning && (
                                    <button
                                        onClick={handleDiscardSession}
                                        className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Discard
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowEndModal(false)}
                                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors ml-auto"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveSession}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Progress'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                reviewBook && (
                    <ReviewModal
                        isOpen={true}
                        onClose={() => handleReviewComplete()}
                        bookId={reviewBook.bookId}
                        bookTitle={reviewBook.title}
                        onReviewSubmitted={() => handleReviewComplete()}
                    />
                )
            }
        </>
    );
}
