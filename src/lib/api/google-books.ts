import type { Price } from '@/types';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

const searchCache = new Map<string, { data: any[], timestamp: number }>();
const idCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 3600 * 1000; // 1 hour


export interface GoogleBook {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        imageLinks?: {
            thumbnail: string;
            smallThumbnail: string;
        };
        industryIdentifiers?: {
            type: string;
            identifier: string;
        }[];
        categories?: string[];
        pageCount?: number;
        averageRating?: number;
        ratingsCount?: number;
        publishedDate?: string;
        subtitle?: string;
    };
    saleInfo?: {
        saleability: string;
        retailPrice?: {
            amount: number;
            currencyCode: string;
        };
    };
    accessInfo?: {
        webReaderLink?: string;
    }
}

export const isISBN = (query: string) => {
    return /^(97(8|9))?\d{9}(\d|X)$/.test(query.replace(/[-\s]/g, ''));
};

function extractSeriesInfo(title: string, subtitle?: string): { seriesName: string | null, seriesOrder: number | null } {
    return { seriesName: null, seriesOrder: null };
}

function mapGoogleBookToDomain(gBook: GoogleBook) {
    const info = gBook.volumeInfo;
    const isbns = info.industryIdentifiers || [];
    const isbn13 = isbns.find(i => i.type === 'ISBN_13')?.identifier;
    const isbn10 = isbns.find(i => i.type === 'ISBN_10')?.identifier;
    const isbn = isbn13 || isbn10;

    // Get the best quality cover image
    let coverUrl: string | null = null;
    if (info.imageLinks) {
        // Prefer thumbnail over smallThumbnail
        const baseUrl = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail;
        if (baseUrl) {
            coverUrl = baseUrl
                .replace(/^http:\/\//, 'https://') // Force HTTPS
                .replace('&zoom=5', '&zoom=1')      // Fix zoom/resolution issues
                .replace('&edge=curl', '');         // Remove page curl effect
        }
    }

    // Fallback to OpenLibrary if Google Books has no cover
    if (!coverUrl && isbn) {
        coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    }

    // Extract Series Info
    const seriesInfo = extractSeriesInfo(info.title, info.subtitle);

    return {
        id: gBook.id,
        title: info.title,
        author: info.authors?.[0] || 'Unknown Author',
        authors: info.authors || [],
        isbn: isbn || '0000000000',
        coverUrl: coverUrl,
        categories: info.categories || [],
        pageCount: info.pageCount || 0,
        publishedDate: info.publishedDate || '',
        rating: info.averageRating || 0,
        ratingsCount: info.ratingsCount || 0,
        description: info.description || '',
        seriesName: seriesInfo.seriesName,
        seriesOrder: seriesInfo.seriesOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prices: [] as Price[]
    };
}

export async function searchGoogleBooks(query: string, maxResults: number = 10, offset: number = 0, lang: string = 'en') {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
    console.log(`[GoogleBooks] Searching: "${query}" (Limit: ${maxResults}, Offset: ${offset})`);

    if (!apiKey) {
        console.error('Google Books API key is missing');
        // Don't throw to avoid crashing UI, just return empty
        return [];
    }


    const cacheKey = `${query}-${maxResults}-${offset}-${lang}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${offset}&langRestrict=${lang}&key=${apiKey}&printType=books`;
    const MAX_RETRIES = 2; // Conservative retry limit
    const BASE_DELAY = 1000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

            // Cache Google Books queries for 1 hour to prevent redundant external API hits
            const response = await fetch(url, {
                signal: controller.signal,
                next: { revalidate: 3600 }
            });
            clearTimeout(timeoutId);

            if (response.status === 429) {
                const delay = BASE_DELAY * Math.pow(2, attempt);
                console.warn(`[GoogleBooks] Rate limit (429). Retrying in ${delay}ms (Attempt ${attempt + 1}/${MAX_RETRIES})`);
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }

            if (!response.ok) {
                console.error(`[GoogleBooks] Error ${response.status}: ${response.statusText}`);
                if (attempt < MAX_RETRIES && response.status >= 500) {
                    // Retry on server errors too
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                throw new Error(`Google Books API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const mappedResults = (data.items || []).map(mapGoogleBookToDomain);
            searchCache.set(cacheKey, { data: mappedResults, timestamp: Date.now() });
            return mappedResults;

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.error(`[GoogleBooks] Timeout for query: "${query}"`);
                return []; // Fail gracefully on timeout
            }
            console.error(`[GoogleBooks] Attempt ${attempt + 1} failed:`, error);
            if (attempt === MAX_RETRIES) return [];
        }
    }
    return [];
}

export async function getGoogleBookById(id: string): Promise<any | null> {
    const cached = idCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

    const MAX_RETRIES = 2;
    const BASE_DELAY = 1000;
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const url = apiKey
                ? `${GOOGLE_BOOKS_API_URL}/${id}?key=${apiKey}`
                : `${GOOGLE_BOOKS_API_URL}/${id}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            // Cache specific book detail fetches for 24 hours
            const response = await fetch(url, {
                signal: controller.signal,
                next: { revalidate: 86400 }
            });
            clearTimeout(timeoutId);

            if (response.status === 429) {
                if (attempt < MAX_RETRIES) {
                    const delay = BASE_DELAY * Math.pow(2, attempt);
                    console.warn(`[GoogleBooks] ID Fetch Rate Limited (429). Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }

            if (!response.ok) return null;

            const gBook = await response.json();
            const mappedData = mapGoogleBookToDomain(gBook);
            idCache.set(id, { data: mappedData, timestamp: Date.now() });
            return mappedData;
        } catch (error) {
            console.error('Google Books Fetch Error:', error);
            if (attempt === MAX_RETRIES) return null;
        }
    }
    return null;
}

export async function getBookByISBN(isbn: string, countryCode: string = 'US'): Promise<any | null> {
    try {
        const cleanIsbn = isbn.replace(/[-\s]/g, '');
        // Use the countryCode for discovery, defaulting to US to find the book even if not in local store
        const results = await searchGoogleBooks(`isbn:${cleanIsbn}`, 1, 0, 'en');
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        return null;
    }
}

export const searchBooks = searchGoogleBooks;

export async function getGoogleEbookPrice(isbn: string, bookId: string, countryCode: string = 'IN'): Promise<Price | null> {
    try {
        const cacheKey = `price-${isbn}-${bookId}-${countryCode}`;
        const cached = idCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

        const query = `isbn:${isbn}`;
        const params = new URLSearchParams({
            q: query,
            printType: 'books',
            gl: countryCode,
        });

        const apiKey = process.env.GOOGLE_BOOKS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
        if (apiKey) {
            params.append('key', apiKey);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Cache pricing lookups for a few hours
        const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params.toString()}`, {
            signal: controller.signal,
            next: { revalidate: 10800 } // 3 hours
        });
        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const data = await response.json();
        const item = data.items?.[0]; // Best match

        if (!item || !item.saleInfo) return null;

        const saleInfo = item.saleInfo;

        // Handle "FOR_SALE" or similar statuses
        if (saleInfo.saleability !== 'FOR_SALE' && saleInfo.saleability !== 'FOR_SALE_AND_RENTAL') {
            return null;
        }

        const retailPrice = saleInfo.retailPrice;
        if (!retailPrice) return null;

        const result: Price = {
            id: `google-${bookId}`,
            bookId,
            source: 'google_books',
            priceNew: retailPrice.amount,
            priceUsed: null,
            currency: retailPrice.currencyCode,
            url: item.volumeInfo?.infoLink || item.accessInfo?.webReaderLink || null,
            fetchedAt: new Date().toISOString(),
        };

        idCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;

    } catch (error) {
        console.error('Google Books Price Fetch Error:', error);
        return null;
    }
}
