
import { createClient } from '@/lib/supabase/client';
import { GoogleBook } from './google-books';
import { getGoogleBookById } from './google-books';

export type ReadingStatus = 'wishlist' | 'reading' | 'completed';

export interface LibraryItem {
    book_id: string;
    status: ReadingStatus;
    rating?: number;
    review?: string;
    started_at?: string;
    finished_at?: string;
    current_page?: number;
    total_minutes_read?: number;
    series_name?: string | null;
    series_order?: number | null;
    book: {
        id: string;
        title: string;
        authors: string[];
        cover_url: string;
        page_count?: number;
        series_name?: string | null;
        series_order?: number | null;
        global_book_metadata?: any;
    }
}

export interface ReadingSession {
    id: string;
    library_id: string;
    started_at: string;
    ended_at?: string;
    duration_minutes?: number;
    pages_start: number;
    pages_end: number;
    pages_read?: number;
    notes?: string;
}

// 1. Ensure book exists in our DB cache
export async function ensureBookExists(googleId: string): Promise<string | null> {
    const supabase = createClient();

    // Check if exists
    const { data: existing } = await supabase
        .from('books')
        .select('id')
        .eq('google_id', googleId)
        .single();

    if (existing) return existing.id;

    // Fetch from Google
    const bookData = await getGoogleBookById(googleId);
    if (!bookData) return null;

    // Insert
    const { data: inserted, error } = await supabase
        .from('books')
        .insert({
            google_id: googleId,
            isbn: bookData.isbn,
            title: bookData.title,
            authors: bookData.authors || [],
            description: bookData.description,
            cover_url: bookData.coverUrl,
            categories: bookData.categories || [],
            page_count: bookData.pageCount,
            published_date: bookData.publishedDate,
            series_name: bookData.seriesName || null,
            series_order: bookData.seriesOrder || null
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error caching book:', error);
        return null;
    }
    return inserted.id;
}

// 2. Add/Update User Library
export async function addToLibrary(userId: string, googleId: string, status: ReadingStatus) {
    const supabase = createClient();

    // Get UUID for book (creating if needed)
    const bookUuid = await ensureBookExists(googleId);
    if (!bookUuid) throw new Error("Could not find or cache book");

    const { data, error } = await supabase
        .from('user_library')
        .upsert({
            user_id: userId,
            book_id: bookUuid,
            status: status,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, book_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createManualBook(userId: string, bookDetails: {
    title: string;
    authors: string[];
    page_count: number;
    status: ReadingStatus;
    cover_url?: string;
    categories?: string[];
}) {
    const supabase = createClient();

    // 1. Insert into books table with NULL google_id
    const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({
            title: bookDetails.title,
            authors: bookDetails.authors,
            page_count: bookDetails.page_count,
            cover_url: bookDetails.cover_url || null,
            categories: bookDetails.categories || [],
            google_id: null,
            isbn: null
        })
        .select('id')
        .single();

    if (bookError) throw bookError;

    // 2. Add to user library
    const { data: libraryItem, error: libraryError } = await supabase
        .from('user_library')
        .insert({
            user_id: userId,
            book_id: book.id,
            status: bookDetails.status,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (libraryError) throw libraryError;
    return libraryItem;
}

export async function removeFromLibrary(userId: string, bookId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId);

    if (error) throw error;
    return true;
}

export async function getUserLibrary(userId: string, status?: ReadingStatus) {
    const supabase = createClient();

    let query = supabase
        .from('user_library')
        .select(`
            *,
            book:books (id, title, authors, cover_url, page_count, series_name, series_order, global_book_metadata(series_name, series_order))
        `)
        .eq('user_id', userId);

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getBookStatus(userId: string, googleId: string): Promise<ReadingStatus | null> {
    const supabase = createClient();

    // First find the our internal UUID for this google_id
    const { data: book } = await supabase
        .from('books')
        .select('id')
        .eq('google_id', googleId)
        .single();

    if (!book) return null;

    // Then check library
    const { data: libraryItem } = await supabase
        .from('user_library')
        .select('status')
        .eq('user_id', userId)
        .eq('book_id', book.id)
        .single();

    return libraryItem?.status || null;
}

export async function updateLibraryStatus(userId: string, bookId: string, status: ReadingStatus) {
    const supabase = createClient();

    const updates: any = {
        status: status,
        updated_at: new Date().toISOString()
    };

    if (status === 'reading') {
        // Only set started_at if it's NOT already set
        const { data: current } = await supabase
            .from('user_library')
            .select('started_at')
            .eq('user_id', userId)
            .eq('book_id', bookId)
            .single();

        if (!current?.started_at) {
            updates.started_at = new Date().toISOString();
        }
    }

    // Using internal UUID to update status
    const { data, error } = await supabase
        .from('user_library')
        .update(updates)
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function ensureBookStarted(userId: string, bookId: string) {
    const supabase = createClient();

    const { data: current } = await supabase
        .from('user_library')
        .select('started_at')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

    if (!current?.started_at) {
        const now = new Date().toISOString();
        await supabase
            .from('user_library')
            .update({ started_at: now })
            .eq('user_id', userId)
            .eq('book_id', bookId);
        return now;
    }
    return current.started_at;
}

export async function updateLibraryProgress(userId: string, bookId: string, page: number, status?: ReadingStatus) {
    const supabase = createClient();

    const updateData: any = {
        current_page: page,
        updated_at: new Date().toISOString()
    };

    if (status) {
        updateData.status = status;
        if (status === 'completed') {
            updateData.finished_at = new Date().toISOString();
        }
    }

    const { data, error } = await supabase
        .from('user_library')
        .update(updateData)
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateBookStartedDate(userId: string, libraryId: string, date: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('user_library')
        .update({
            started_at: date,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('id', libraryId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// READING SESSION MANAGEMENT
// ============================================

/**
 * Start a new reading session
 */
export async function startReadingSession(
    userId: string,
    libraryId: string,
    currentPage: number = 0
): Promise<ReadingSession | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('reading_sessions')
        .insert({
            user_id: userId,
            library_id: libraryId,
            started_at: new Date().toISOString(),
            pages_start: currentPage
        })
        .select()
        .single();

    if (error) {
        console.error('Error starting session:', error);
        return null;
    }
    return data;
}

/**
 * End an active reading session
 */
export async function endReadingSession(
    sessionId: string,
    endPage: number,
    notes?: string
): Promise<ReadingSession | null> {
    const supabase = createClient();

    // First get the session to calculate duration
    const { data: session } = await supabase
        .from('reading_sessions')
        .select('started_at')
        .eq('id', sessionId)
        .single();

    if (!session) return null;

    const startTime = new Date(session.started_at);
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const { data, error } = await supabase
        .from('reading_sessions')
        .update({
            ended_at: endTime.toISOString(),
            duration_minutes: durationMinutes,
            pages_end: endPage,
            notes: notes || null
        })
        .eq('id', sessionId)
        .select()
        .single();

    if (error) {
        console.error('Error ending session:', error);
        return null;
    }
    return data;
}

/**
 * Get active (unclosed) session for a user
 */
export async function getActiveSession(userId: string): Promise<ReadingSession | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('user_id', userId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error fetching active session:', error);
    }
    return data || null;
}

/**
 * Get reading sessions for a library item
 */
export async function getReadingSessions(
    libraryId: string,
    limit: number = 10
): Promise<ReadingSession[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('library_id', libraryId)
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching sessions:', error);
        return [];
    }
    return data || [];
}

/**
 * Get weekly reading stats for a user (last 7 days)
 */
/**
 * Get weekly reading stats for a user (last 7 days)
 */
export async function getWeeklyReadingStats(userId: string): Promise<{
    totalMinutes: number;
    totalPages: number;
    dailyStats: { date: string; minutes: number; pages: number }[];
    moodCounts: Record<string, number>;
}> {
    const supabase = createClient();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
        .from('reading_sessions')
        .select('started_at, duration_minutes, pages_read, notes')
        .eq('user_id', userId)
        .not('ended_at', 'is', null)
        .gte('started_at', sevenDaysAgo.toISOString());

    if (error || !data) {
        return { totalMinutes: 0, totalPages: 0, dailyStats: [], moodCounts: {} };
    }

    // Aggregate by day
    const dailyMap = new Map<string, { minutes: number; pages: number }>();
    const moodCounts: Record<string, number> = {};

    // Initialize last 7 days
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        dailyMap.set(dateKey, { minutes: 0, pages: 0 });
    }

    // Sum up sessions
    let totalMinutes = 0;
    let totalPages = 0;

    for (const session of data) {
        const dateKey = session.started_at.split('T')[0];
        const existing = dailyMap.get(dateKey) || { minutes: 0, pages: 0 };

        const mins = session.duration_minutes || 0;
        const pages = session.pages_read || 0;

        dailyMap.set(dateKey, {
            minutes: existing.minutes + mins,
            pages: existing.pages + pages
        });

        totalMinutes += mins;
        totalPages += pages;

        // Aggregate Moods (stored in notes)
        if (session.notes) {
            // Check if note matches one of our known moods
            const knownMoods = ['Focused', 'Relaxed', 'Reflective', 'Sleepy', 'Excited', 'Bored'];
            if (knownMoods.includes(session.notes)) {
                moodCounts[session.notes] = (moodCounts[session.notes] || 0) + 1;
            }
        }
    }

    // Convert to array, sorted oldest to newest
    const dailyStats = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return { totalMinutes, totalPages, dailyStats, moodCounts };
}

/**
 * Get all reading sessions for a user (for analytics)
 */
export async function getAllReadingSessions(userId: string): Promise<{
    started_at: string;
    duration_minutes: number;
    pages_read: number;
}[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('reading_sessions')
        .select('started_at, duration_minutes, pages_read')
        .eq('user_id', userId)
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: true });

    if (error) {
        console.error('Error fetching all sessions:', error);
        return [];
    }
    return data || [];
}


/**
 * Get library item with book details by library ID
 */
export async function getLibraryItemById(libraryId: string): Promise<LibraryItem | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('user_library')
        .select(`
            *,
            book:books (id, title, authors, cover_url, page_count)
        `)
        .eq('id', libraryId)
        .single();

    if (error) return null;
    return data;
}

export async function updateReview(userId: string, bookId: string, rating: number, review: string, isPublic: boolean = true, dislikeReasons: string[] = []) {
    console.log('[updateReview] Starting review update:', { userId, bookId, rating, isPublic, dislikeReasons });
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");

    // 1. Update User Library with rating/review
    // Check if the row exists first
    const { count } = await supabase
        .from('user_library')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('book_id', bookId);

    console.log('[updateReview] Found matching library rows:', count);

    if (count === 0) {
        throw new Error(`Book not found in library (User: ${userId}, Book: ${bookId})`);
    }

    const { data, error } = await supabase
        .from('user_library')
        .update({
            rating: rating,
            review: review,
            is_review_public: isPublic,
            dislike_reasons: dislikeReasons,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .select()
        .single();

    if (error) {
        console.error('[updateReview] Supabase update error:', error);
        throw error;
    }

    console.log('[updateReview] Update successful:', data);

    // 2. Log Activity (Only if public)
    if (isPublic) {
        // Fetch book details for activity log
        const { data: book } = await supabase
            .from('books')
            .select('title, cover_url')
            .eq('id', bookId)
            .single();

        await supabase.from('activities').insert({
            user_id: userId,
            type: 'reviewed',
            book_id: bookId,
            book_title: book?.title,
            book_cover: book?.cover_url,
            metadata: {
                rating: rating,
                review_snippet: review ? review.substring(0, 100) : undefined,
                dislike_reasons: dislikeReasons.length > 0 ? dislikeReasons : undefined
            }
        });
    }

    return data;
}

/**
 * Get user's top rated books (4 stars and above)
 */
export async function getTopRatedBooks(userId: string, limit: number = 5) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('user_library')
        .select(`
            *,
            book:books (id, title, authors, cover_url, page_count, series_name, series_order, global_book_metadata(series_name, series_order))
        `)
        .eq('user_id', userId)
        .gte('rating', 4)
        .order('updated_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching top rated books:', error);
        return [];
    }
    return data || [];
}

