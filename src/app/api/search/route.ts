import { NextRequest, NextResponse } from 'next/server';
import { searchGoogleBooks, getBookByISBN, isISBN } from '@/lib/api/google-books';
import { fetchAllPrices } from '@/lib/api/prices';
import type { BookWithPrices, ApiResponse, SearchResult } from '@/types';

// Cache duration: 24 hours in milliseconds
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

// In-memory cache (in production, use Supabase)
const bookCache = new Map<string, { book: BookWithPrices; cachedAt: number }>();

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const region = searchParams.get('region') || 'US';

    if (!query?.trim()) {
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Search query is required',
        }, { status: 400 });
    }

    try {
        let books: BookWithPrices[];
        let fromCache = false;

        // Check if it's an ISBN search
        if (isISBN(query)) {
            const cacheKey = `isbn:${query.replace(/[-\s]/g, '')}:${region}`;
            const cached = getCachedBook(cacheKey);

            if (cached) {
                books = [cached];
                fromCache = true;
            } else {
                const book = await getBookByISBN(query);
                if (book) {
                    const prices = await fetchAllPrices(book.isbn, book.id, region);
                    const bookWithPrices: BookWithPrices = { ...book, prices };
                    setCachedBook(cacheKey, bookWithPrices);
                    books = [bookWithPrices];
                } else {
                    books = [];
                }
            }
        } else {
            // Title/Author search
            // For now, only caching individual books, search results are fresh to respect region changes easier
            const rawBooks = await searchGoogleBooks(query, 12);

            // Fetch prices for each book (in parallel)
            const booksWithPrices = await Promise.all(
                rawBooks.map(async (book) => {
                    const bookCacheKey = `isbn:${book.isbn}:${region}`;
                    const cached = getCachedBook(bookCacheKey);

                    if (cached) {
                        return cached;
                    }

                    const prices = await fetchAllPrices(book.isbn, book.id, region);
                    const bookWithPrices: BookWithPrices = { ...book, prices };
                    setCachedBook(bookCacheKey, bookWithPrices);
                    return bookWithPrices;
                })
            );

            books = booksWithPrices;
        }

        const result: SearchResult = {
            books,
            query,
            source: fromCache ? 'cache' : 'external',
            totalResults: books.length,
        };

        return NextResponse.json<ApiResponse<SearchResult>>({
            success: true,
            data: result,
            cached: fromCache,
        });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to search books',
        }, { status: 500 });
    }
}

// Helper functions for caching
function getCachedBook(key: string): BookWithPrices | null {
    const cached = bookCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.cachedAt > CACHE_DURATION_MS) {
        bookCache.delete(key);
        return null;
    }

    return cached.book;
}

function setCachedBook(key: string, book: BookWithPrices): void {
    bookCache.set(key, { book, cachedAt: Date.now() });
}
