
const LIBRIVOX_BASE_URL = 'https://librivox.org/api/feed/audiobooks';

export interface LibriVoxBook {
    id: string;
    title: string;
    description: string;
    url_librivox: string; // Link to LibriVox page
    url_zip_file?: string; // We might use this or the RSS feed for streaming
    total_time: string;
}

/**
 * Searches LibriVox for an audiobook by title and author.
 * Returns the first match if found.
 */
export async function getAudiobook(title: string, author: string): Promise<LibriVoxBook | null> {
    try {
        // Construct query parameters
        // We use a simplified title search to increase hit rate
        const query = `title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&format=json`;

        const response = await fetch(`${LIBRIVOX_BASE_URL}?${query}`);

        if (!response.ok) return null;

        const data = await response.json();

        if (data.books && data.books.length > 0) {
            return data.books[0];
        }

        return null;
    } catch (error) {
        console.error('LibriVox Fetch Error:', error);
        return null; // Fail gracefully
    }
}
