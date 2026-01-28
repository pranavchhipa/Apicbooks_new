
const GUTENDEX_BASE_URL = 'https://gutendex.com/books';

export interface GutenbergBook {
    id: number;
    title: string;
    authors: { name: string }[];
    formats: Record<string, string>; // Mime-type -> URL
    download_count: number;
}

export async function getGutenbergBook(title: string, author: string): Promise<GutenbergBook | null> {
    try {
        const query = `search=${encodeURIComponent(title)} ${encodeURIComponent(author)}`;
        const response = await fetch(`${GUTENDEX_BASE_URL}?${query}`);

        if (!response.ok) return null;

        const data = await response.json();

        // Return first match if available
        if (data.results && data.results.length > 0) {
            return data.results[0];
        }

        return null;
    } catch (error) {
        console.error('Gutendex API Error:', error);
        return null;
    }
}

// Helper to get a readable link (epub or html)
export function getGutenbergReadLink(book: GutenbergBook): string | null {
    const formats = book.formats;
    return formats['text/html'] || formats['application/epub+zip'] || formats['text/plain'] || null;
}
