// Book types
export interface Book {
    id: string;
    isbn: string;
    title: string;
    authors: string[];
    description: string | null;
    coverUrl: string | null;
    categories: string[];
    pageCount: number | null;
    publishedDate: string | null;
    createdAt: string;
    updatedAt: string;
    rating?: number;
    readLink?: string; // URL to Open Library reader
    audiobookUrl?: string; // URL to LibriVox audiobook page
    audiobookDuration?: string;
}

export interface Price {
    id: string;
    bookId: string;
    source: PriceSource;
    priceNew: number | null;
    priceUsed: number | null;
    currency: string;
    url: string | null;
    fetchedAt: string;
}

export type PriceSource =
    | 'amazon'
    | 'ebay'
    | 'bookdepository'
    | 'abebooks'
    | 'thriftbooks'
    | 'google_books'
    | 'itbookstore'
    | 'flipkart'
    | 'barnes_noble'
    | 'alibris'
    | 'betterworldbooks'
    | 'powells'
    | 'bookfinder';

export interface BookWithPrices extends Book {
    prices: Price[];
}

// Wishlist types
export interface WishlistItem {
    id: string;
    userId: string;
    bookId: string;
    addedAt: string;
    book?: Book;
}

// Search types
export interface SearchResult {
    books: BookWithPrices[];
    query: string;
    source: 'cache' | 'external';
    totalResults: number;
}

export interface MoodSearchResult {
    books: BookWithPrices[];
    mood: string;
    aiExplanation: string;
}

// Google Books API types
export interface GoogleBooksResponse {
    kind: string;
    totalItems: number;
    items?: GoogleBookItem[];
}

export interface GoogleBookItem {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        industryIdentifiers?: {
            type: string;
            identifier: string;
        }[];
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
        categories?: string[];
        pageCount?: number;
        publishedDate?: string;
    };
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    cached?: boolean;
}

// Auth types
export interface User {
    id: string;
    email: string;
    createdAt: string;
}

// UI State types
export interface SearchState {
    query: string;
    isLoading: boolean;
    results: BookWithPrices[];
    error: string | null;
}

export interface MoodState {
    mood: string;
    isLoading: boolean;
    results: BookWithPrices[];
    aiExplanation: string | null;
    error: string | null;
}
