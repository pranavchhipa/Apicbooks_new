
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';

export interface OpenLibraryWork {
    key: string;
    title: string;
    cover_i?: number;
    ebook_count_i?: number;
}

/**
 * Fetches high-quality cover and read link from Open Library
 */
export async function getOpenLibraryData(isbn: string) {
    try {
        const response = await fetch(`${OPEN_LIBRARY_BASE_URL}/isbn/${isbn}.json`, {
            headers: {
                'User-Agent': 'ApicBooks/1.0 (support@apicbooks.com)'
            }
        });

        if (!response.ok) return null;

        const data = await response.json();

        return {
            coverUrl: data.covers ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` : null,
            readLink: data.key ? `${OPEN_LIBRARY_BASE_URL}${data.key}` : null // Improved logic to point to work page
        };
    } catch (error) {
        console.error('Open Library Fetch Error:', error);
        return null;
    }
}
