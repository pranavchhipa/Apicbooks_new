
const NYT_API_BASE_URL = 'https://api.nytimes.com/svc/books/v3';

export interface BestSellerBook {
    rank: number;
    rank_last_week: number;
    weeks_on_list: number;
    primary_isbn13: string;
    description: string;
    title: string;
    author: string;
    book_image: string;
    amazon_product_url: string;
}

export async function getNYTBestSellers(): Promise<BestSellerBook[]> {
    const apiKey = process.env.NEXT_PUBLIC_NYT_API_KEY; // Expects key in env

    if (!apiKey) {
        console.warn('NYT API Key is missing. Returning empty list.');
        return [];
    }

    try {
        // Fetch Hardcover Fiction list
        const response = await fetch(`${NYT_API_BASE_URL}/lists/current/hardcover-fiction.json?api-key=${apiKey}`);

        if (!response.ok) return [];

        const data = await response.json();
        return data.results.books;
    } catch (error) {
        console.error('NYT API Error:', error);
        return [];
    }
}
