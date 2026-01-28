

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

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
        publishedDate?: string;
    };
    saleInfo?: {
        saleability: string;
        retailPrice?: {
            amount: number;
            currencyCode: string;
        };
    };
}

export const isISBN = (query: string) => {
    return /^(97(8|9))?\d{9}(\d|X)$/.test(query.replace(/[-\s]/g, ''));
};

export async function searchGoogleBooks(query: string, maxResults: number = 20, countryCode: string = 'IN'): Promise<any[]> {
    try {
        const params = new URLSearchParams({
            q: query,
            maxResults: maxResults.toString(),
            printType: 'books',
            gl: countryCode, // Dynamic Regional Lock
        });

        const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Failed to fetch from Google Books');
        }

        const data = await response.json();
        return (data.items || []).map(mapGoogleBookToDomain);
    } catch (error) {
        console.error('Google Books API Error:', error);
        return [];
    }
}

// ... existing imports

export async function getGoogleBookById(id: string): Promise<any | null> {
    try {
        const response = await fetch(`${GOOGLE_BOOKS_API_URL}/${id}`);
        if (!response.ok) return null;

        const gBook = await response.json();
        return mapGoogleBookToDomain(gBook);
    } catch (error) {
        console.error('Google Books Fetch Error:', error);
        return null;
    }
}

export async function getBookByISBN(isbn: string): Promise<any | null> {
    try {
        const results = await searchGoogleBooks(`isbn:${isbn}`, 1);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        return null;
    }
}

// Map Google Book format to our internal simplified format (BookWithPrices-like without prices)
function mapGoogleBookToDomain(gBook: GoogleBook) {
    const info = gBook.volumeInfo;
    const isbns = info.industryIdentifiers || [];
    const isbn13 = isbns.find(i => i.type === 'ISBN_13')?.identifier;
    const isbn10 = isbns.find(i => i.type === 'ISBN_10')?.identifier;

    // Get the best quality cover image
    let coverUrl: string | null = null;
    if (info.imageLinks) {
        // Prefer thumbnail over smallThumbnail, and upgrade to larger size
        const baseUrl = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail;
        if (baseUrl) {
            coverUrl = baseUrl
                .replace('http:', 'https:')
                .replace('&zoom=1', '&zoom=2')  // Request larger image
                .replace('&edge=curl', '');
        }
    }

    return {
        id: gBook.id,
        title: info.title,
        author: info.authors?.[0] || 'Unknown Author',
        authors: info.authors || [],
        isbn: isbn13 || isbn10 || '0000000000',
        coverUrl: coverUrl,  // Fixed: was cover_url (snake_case)
        categories: info.categories || [],
        pageCount: info.pageCount || 0,  // Fixed: was total_pages
        publishedDate: info.publishedDate || '',  // Fixed: was published_date
        rating: info.averageRating || 0,
        description: info.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}


export const searchBooks = searchGoogleBooks;

import type { Price } from '@/types';

export async function getGoogleEbookPrice(isbn: string, bookId: string, countryCode: string = 'IN'): Promise<Price | null> {
    try {
        const query = `isbn:${isbn}`;
        const params = new URLSearchParams({
            q: query,
            printType: 'books',
            gl: countryCode,
        });

        const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params.toString()}`);
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

        return {
            id: `google-${bookId}`,
            bookId,
            source: 'google_books',
            priceNew: retailPrice.amount,
            priceUsed: null,
            currency: retailPrice.currencyCode,
            url: item.volumeInfo?.infoLink || item.accessInfo?.webReaderLink,
            fetchedAt: new Date().toISOString(),
        };

    } catch (error) {
        console.error('Google Books Price Fetch Error:', error);
        return null;
    }
}


