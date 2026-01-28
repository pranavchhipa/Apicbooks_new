import type { Price, PriceSource } from '@/types';
import { getGoogleEbookPrice } from './google-books';
import { fetchITBookStorePrice } from './prices/itbookstore';
import { scrapeAmazonPrice, scrapeFlipkartPrice, scrapeEbayPrice, scrapeAbebooksPrice, scrapeThriftbooksPrice } from './scrapers';

/**
 * Generate a static search link price object (no real price, just link)
 */
function createSearchLinkPrice(source: PriceSource, bookId: string, url: string, currency: string = 'USD'): Price {
    return {
        id: `${source}-${bookId}`,
        bookId,
        source,
        priceNew: null,
        priceUsed: null,
        url,
        currency,
        fetchedAt: new Date().toISOString(),
    };
}

// --- Existing retailers ---

export async function fetchAmazonPrices(isbn: string, bookId: string, region: string = 'IN'): Promise<Price> {
    const tldMap: Record<string, string> = {
        'IN': 'in', 'GB': 'co.uk', 'CA': 'ca', 'AU': 'com.au', 'US': 'com'
    };
    const currencyMap: Record<string, string> = {
        'IN': 'INR', 'GB': 'GBP', 'CA': 'CAD', 'AU': 'AUD', 'US': 'USD'
    };
    const tld = tldMap[region] || 'com';
    return createSearchLinkPrice('amazon', bookId, `https://www.amazon.${tld}/s?k=${isbn}`, currencyMap[region] || 'USD');
}

export async function fetchEbayPrices(isbn: string, bookId: string, region: string = 'IN'): Promise<Price> {
    return createSearchLinkPrice('ebay', bookId, `https://www.ebay.com/sch/i.html?_nkw=${isbn}`, 'USD');
}

export async function fetchAbebooksPrices(isbn: string, bookId: string): Promise<Price> {
    return createSearchLinkPrice('abebooks', bookId, `https://www.abebooks.com/servlet/SearchResults?isbn=${isbn}`, 'USD');
}

export async function fetchThriftbooksPrices(isbn: string, bookId: string): Promise<Price> {
    return createSearchLinkPrice('thriftbooks', bookId, `https://www.thriftbooks.com/browse/?b.search=${isbn}`, 'USD');
}

export async function fetchFlipkartPrices(isbn: string, bookId: string, title?: string, author?: string): Promise<Price> {
    const query = title ? `${title} ${author || ''} book` : isbn;
    return createSearchLinkPrice('flipkart', bookId, `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search&marketplace=FLIPKART`, 'INR');
}

// --- NEW retailers ---

export async function fetchBarnesNoblePrices(isbn: string, bookId: string): Promise<Price> {
    return createSearchLinkPrice('barnes_noble', bookId, `https://www.barnesandnoble.com/s/${isbn}`, 'USD');
}

export async function fetchAlibrisPrices(isbn: string, bookId: string): Promise<Price> {
    return createSearchLinkPrice('alibris', bookId, `https://www.alibris.com/search/books/isbn/${isbn}`, 'USD');
}

export async function fetchBetterWorldBooksPrices(isbn: string, bookId: string): Promise<Price> {
    return createSearchLinkPrice('betterworldbooks', bookId, `https://www.betterworldbooks.com/search/results?q=${isbn}`, 'USD');
}

export async function fetchPowellsPrices(isbn: string, bookId: string): Promise<Price> {
    return createSearchLinkPrice('powells', bookId, `https://www.powells.com/searchresults?keyword=${isbn}`, 'USD');
}

export async function fetchBookFinderPrices(isbn: string, bookId: string): Promise<Price> {
    // BookFinder is a meta-search, great for comparing
    return createSearchLinkPrice('bookfinder', bookId, `https://www.bookfinder.com/search/?isbn=${isbn}&mode=isbn&st=sr&ac=qr`, 'USD');
}

/**
 * Fetch prices from all sources in parallel
 */
export async function fetchAllPrices(isbn: string, bookId: string, region: string = 'IN', title?: string, author?: string): Promise<Price[]> {

    // Helper to try scrape, fallback to link
    const getAmazon = async () => {
        const scraped = await scrapeAmazonPrice(isbn, bookId);
        if (scraped) return scraped;
        return fetchAmazonPrices(isbn, bookId, region);
    };

    const getFlipkart = async () => {
        const scraped = await scrapeFlipkartPrice(isbn, bookId, title);
        if (scraped) return scraped;
        return fetchFlipkartPrices(isbn, bookId, title, author);
    };

    const getEbay = async () => {
        const scraped = await scrapeEbayPrice(isbn, bookId, region);
        if (scraped) return scraped;
        return fetchEbayPrices(isbn, bookId, region);
    };

    const getAbebooks = async () => {
        const scraped = await scrapeAbebooksPrice(isbn, bookId);
        if (scraped) return scraped;
        return fetchAbebooksPrices(isbn, bookId);
    };

    const getThriftbooks = async () => {
        const scraped = await scrapeThriftbooksPrice(isbn, bookId);
        if (scraped) return scraped;
        return fetchThriftbooksPrices(isbn, bookId);
    };

    const promises = [
        // Real Data APIs
        getGoogleEbookPrice(isbn, bookId, region),
        fetchITBookStorePrice(isbn, bookId),

        // Scrapers with Link Fallback
        getAmazon(),
        getFlipkart(),
        getEbay(),
        getAbebooks(),
        getThriftbooks(),

        // Additional Retailers (link-only for now)
        fetchBarnesNoblePrices(isbn, bookId),
        fetchAlibrisPrices(isbn, bookId),
        fetchBetterWorldBooksPrices(isbn, bookId),
        fetchPowellsPrices(isbn, bookId),
        fetchBookFinderPrices(isbn, bookId),
    ];

    const results = await Promise.allSettled(promises);

    return results
        .filter((r): r is PromiseFulfilledResult<Price | null> => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value as Price);
}

export function getBestPrice(prices: Price[], targetCurrency?: string): { source: PriceSource; price: number; type: 'new' | 'used' } | null {
    let bestDeal: { source: PriceSource; price: number; type: 'new' | 'used' } | null = null;

    for (const p of prices) {
        // If target currency is specified, skip prices that don't match
        if (targetCurrency && p.currency !== targetCurrency) {
            continue;
        }

        if (p.priceNew !== null) {
            if (!bestDeal || p.priceNew < bestDeal.price) {
                bestDeal = { source: p.source, price: p.priceNew, type: 'new' };
            }
        }
        if (p.priceUsed !== null) {
            if (!bestDeal || p.priceUsed < bestDeal.price) {
                bestDeal = { source: p.source, price: p.priceUsed, type: 'used' };
            }
        }
    }

    return bestDeal;
}
