import * as cheerio from 'cheerio';
import { Price } from '@/types';

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function fetchWithRetry(url: string, retries = 2): Promise<string | null> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
                next: { revalidate: 3600 } // Cache for 1 hour
            });

            if (response.ok) return await response.text();
            if (response.status === 404) return null;
        } catch (e) {
            console.warn(`Scrape attempt ${i + 1} failed for ${url}`);
        }
        // Wait a bit before retry
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
    }
    return null;
}

// Helper to extract first valid price from text
function extractPrice(text: string): number | null {
    // Match patterns like ₹342, $19.99, 1,234.56
    const match = text.match(/[₹$£€]?\s*([0-9,]+(?:\.[0-9]{2})?)/);
    if (match) {
        const cleanPrice = match[1].replace(/,/g, '');
        const price = parseFloat(cleanPrice);
        // Sanity check: price should be reasonable (between 1 and 100000)
        if (price > 0 && price < 100000) {
            return price;
        }
    }
    return null;
}

export async function scrapeAmazonPrice(isbn: string, bookId: string): Promise<Price | null> {
    try {
        const url = `https://www.amazon.in/s?k=${isbn}`;
        const html = await fetchWithRetry(url);
        if (!html) return null;

        const $ = cheerio.load(html);

        // Amazon Selectors - Get the first search result price
        // Try multiple selectors in order of preference
        let finalPrice: number | null = null;

        // 1. Try the main price display
        const priceWhole = $('.a-price-whole').first().text().replace(/[^0-9]/g, '');
        const priceFraction = $('.a-price-fraction').first().text().replace(/[^0-9]/g, '') || '00';

        if (priceWhole && priceWhole.length < 7) { // Sanity check
            finalPrice = parseFloat(`${priceWhole}.${priceFraction}`);
        }

        // 2. Fallback to offscreen price
        if (!finalPrice) {
            const offscreen = $('.a-offscreen').first().text();
            finalPrice = extractPrice(offscreen);
        }

        if (finalPrice && finalPrice > 0 && finalPrice < 100000) {
            return {
                id: `amazon-${bookId}`,
                bookId,
                source: 'amazon',
                priceNew: finalPrice,
                priceUsed: null,
                currency: 'INR',
                url: url,
                fetchedAt: new Date().toISOString()
            };
        }
    } catch (e) {
        console.error('Amazon scrape error:', e);
    }
    return null;
}

export async function scrapeFlipkartPrice(isbn: string, bookId: string, title?: string): Promise<Price | null> {
    try {
        const query = title ? `${title} book` : isbn;
        const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search&marketplace=FLIPKART`;

        const html = await fetchWithRetry(url);
        if (!html) return null;

        const $ = cheerio.load(html);

        // Flipkart price selectors - be very specific to avoid concatenation bugs
        let finalPrice: number | null = null;

        // 1. Try the product grid price class (most common)
        const priceElements = $('div[class*="_30jeq3"]');
        if (priceElements.length > 0) {
            // Get just the first element's direct text, not all descendants
            const firstPriceText = priceElements.first().clone().children().remove().end().text()
                || priceElements.first().text();

            // Extract just the first price number
            const match = firstPriceText.match(/₹([0-9,]+)/);
            if (match) {
                finalPrice = parseInt(match[1].replace(/,/g, ''));
            }
        }

        // 2. Fallback: Look for price in product cards
        if (!finalPrice) {
            $('div[data-id]').each((i, el) => {
                if (finalPrice) return; // Already found
                const cardText = $(el).text();
                const match = cardText.match(/₹([0-9,]+)/);
                if (match) {
                    const price = parseInt(match[1].replace(/,/g, ''));
                    if (price > 50 && price < 50000) { // Reasonable book price
                        finalPrice = price;
                    }
                }
            });
        }

        if (finalPrice && finalPrice > 0 && finalPrice < 100000) {
            return {
                id: `flipkart-${bookId}`,
                bookId,
                source: 'flipkart',
                priceNew: finalPrice,
                priceUsed: null,
                currency: 'INR',
                url: url,
                fetchedAt: new Date().toISOString()
            };
        }
    } catch (e) {
        console.error('Flipkart scrape error:', e);
    }
    return null;
}

export async function scrapeEbayPrice(isbn: string, bookId: string, region: string = 'US'): Promise<Price | null> {
    try {
        // eBay.in doesn't have great book selection, use .com for better results
        const url = `https://www.ebay.com/sch/i.html?_nkw=${isbn}&_sop=15&LH_BIN=1`;

        const html = await fetchWithRetry(url);
        if (!html) return null;

        const $ = cheerio.load(html);

        // eBay Selectors - Get first Buy It Now price
        let finalPrice: number | null = null;

        // Skip the first result (usually an ad)
        const priceElements = $('.s-item__price');
        priceElements.each((i, el) => {
            if (finalPrice || i === 0) return; // Skip first (ad) and stop if found
            const priceText = $(el).text();
            const extracted = extractPrice(priceText);
            if (extracted && extracted > 1 && extracted < 1000) {
                finalPrice = extracted;
            }
        });

        if (finalPrice) {
            return {
                id: `ebay-${bookId}`,
                bookId,
                source: 'ebay',
                priceNew: null,
                priceUsed: finalPrice, // eBay is mostly used
                currency: 'USD',
                url: url,
                fetchedAt: new Date().toISOString()
            };
        }
    } catch (e) {
        console.error('eBay scrape error:', e);
    }
    return null;
}

export async function scrapeAbebooksPrice(isbn: string, bookId: string): Promise<Price | null> {
    try {
        const url = `https://www.abebooks.com/servlet/SearchResults?isbn=${isbn}&sortby=17`; // sortby=17 is price+shipping lowest

        const html = await fetchWithRetry(url);
        if (!html) return null;

        const $ = cheerio.load(html);

        // AbeBooks uses specific price display classes
        let finalPrice: number | null = null;

        // Try the item price class
        const priceText = $('p.item-price').first().text() || $('span.item-price').first().text();
        if (priceText) {
            finalPrice = extractPrice(priceText);
        }

        // Fallback: Look for US$ pattern
        if (!finalPrice) {
            const bodyText = $('body').text();
            const match = bodyText.match(/US\$\s*([0-9.]+)/);
            if (match) {
                finalPrice = parseFloat(match[1]);
            }
        }

        if (finalPrice && finalPrice > 0 && finalPrice < 1000) {
            return {
                id: `abebooks-${bookId}`,
                bookId,
                source: 'abebooks',
                priceNew: null,
                priceUsed: finalPrice,
                currency: 'USD',
                url: url,
                fetchedAt: new Date().toISOString()
            };
        }
    } catch (e) {
        console.error('AbeBooks scrape error:', e);
    }
    return null;
}

export async function scrapeThriftbooksPrice(isbn: string, bookId: string): Promise<Price | null> {
    try {
        const url = `https://www.thriftbooks.com/browse/?b.search=${isbn}`;
        const html = await fetchWithRetry(url);
        if (!html) return null;

        const $ = cheerio.load(html);

        let finalPrice: number | null = null;

        // ThriftBooks price selectors
        const priceText = $('[class*="WorkMeta-price"]').first().text()
            || $('[class*="SearchResultListItem-price"]').first().text()
            || $('[class*="price"]').first().text();

        if (priceText) {
            finalPrice = extractPrice(priceText);
        }

        // Fallback: scan for $ pattern in results
        if (!finalPrice) {
            $('.AllEditionsItem, .WorkCard').each((i, el) => {
                if (finalPrice) return;
                const text = $(el).text();
                const match = text.match(/\$([0-9.]+)/);
                if (match) {
                    const price = parseFloat(match[1]);
                    if (price > 1 && price < 100) {
                        finalPrice = price;
                    }
                }
            });
        }

        if (finalPrice && finalPrice > 0 && finalPrice < 1000) {
            return {
                id: `thriftbooks-${bookId}`,
                bookId,
                source: 'thriftbooks',
                priceNew: null,
                priceUsed: finalPrice,
                currency: 'USD',
                url: url,
                fetchedAt: new Date().toISOString()
            };
        }
    } catch (e) {
        console.error('ThriftBooks scrape error:', e);
    }
    return null;
}
