
import { GoogleBook, getGoogleBookById } from './google-books';
import { getOpenLibraryData } from './open-library';
import { getAudiobook } from './librivox';
import { getGutenbergBook, getGutenbergReadLink } from './gutendex';
import { Book } from '@/types';

/**
 * The Unified Book Service
 * Aggregates data from Google Books, Open Library, LibriVox, and Project Gutenberg.
 */
export async function getUnifiedBookDetails(id: string): Promise<Book | null> {
    // 1. Fetch Base Data from Google Books
    const googleBook = await getGoogleBookById(id);
    if (!googleBook) return null;

    // 2. Extract key identifiers
    const isbn = googleBook.isbn || '';
    const title = googleBook.title;
    const author = googleBook.authors ? googleBook.authors[0] : '';

    const publishedDate = googleBook.publishedDate;
    const publishedYear = publishedDate ? parseInt(publishedDate.substring(0, 4)) : null;

    // Simple heuristic: US Public Domain cutoff is roughly 1928.
    // If newer, we likely won't find legal free versions on LibriVox/Gutenberg.
    const isPublicDomain = publishedYear ? publishedYear <= 1928 : false;

    // 3. Parallel Fetch from Enrichment Sources
    // Only query Gutendex/LibriVox if it looks like public domain to avoid false positives on modern books
    const [openLibraryData, libriVoxData, gutenbergData] = await Promise.all([
        isbn ? getOpenLibraryData(isbn) : Promise.resolve(null),
        (isPublicDomain && title && author) ? getAudiobook(title, author) : Promise.resolve(null),
        (isPublicDomain && title && author) ? getGutenbergBook(title, author) : Promise.resolve(null)
    ]);

    // 4. Merge and Return
    return {
        ...googleBook,
        // Prefer Open Library High-Res Cover
        coverUrl: openLibraryData?.coverUrl || googleBook.coverUrl,
        // Capabilities: Prefer Open Library, fallback to Gutenberg
        readLink: openLibraryData?.readLink || (gutenbergData ? (getGutenbergReadLink(gutenbergData) || undefined) : undefined),
        audiobookUrl: libriVoxData?.url_librivox || undefined,
        audiobookDuration: libriVoxData?.total_time || undefined,
        openLibraryId: openLibraryData?.readLink ? 'available' : undefined // Basic flag
    };
}
