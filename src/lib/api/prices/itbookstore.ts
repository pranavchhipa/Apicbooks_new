import type { Price } from '@/types';

export async function fetchITBookStorePrice(isbn: string, bookId: string): Promise<Price | null> {
    // ITBookStore only supports ISBN-13
    if (!isbn || isbn.length !== 13) return null;

    try {
        const response = await fetch(`https://api.itbook.store/1.0/books/${isbn}`);

        if (!response.ok) return null;

        const data = await response.json();

        // API returns error: '0' for success
        if (data.error !== '0' || !data.price) return null;

        // Price format is "$39.99"
        const priceStr = data.price;
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));

        if (isNaN(price) || price === 0) return null;

        return {
            id: `itbookstore-${bookId}`,
            bookId,
            source: 'itbookstore',
            priceNew: price,
            priceUsed: null,
            currency: 'USD', // Always USD
            url: data.url,
            fetchedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error('ITBookStore Fetch Error:', error);
        return null;
    }
}
