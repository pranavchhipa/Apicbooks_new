import { NextRequest, NextResponse } from 'next/server';
import { getMoodRecommendations, getSearchQueries, getAlternativeQueries, DEFAULT_BOOKS } from '@/lib/api/gemini';
import { searchGoogleBooks } from '@/lib/api/google-books';
import { fetchAllPrices } from '@/lib/api/prices';
import type { BookWithPrices, ApiResponse, MoodSearchResult } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { mood, region = 'US' } = body;

        if (!mood?.trim()) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Mood description is required',
            }, { status: 400 });
        }

        console.log('Processing mood search:', mood, 'Region:', region);

        // Parallel Execution: Direct Search + AI Recommendations
        const [directResults, recommendations] = await Promise.all([
            searchGoogleBooks(mood, 4), // Fetch 4 direct matches
            getMoodRecommendations(mood) // Fetch ~10 AI recommendations
        ]);

        console.log(`Got ${directResults.length} direct matches and ${recommendations.length} AI recommendations`);

        // Hydration Logic: Convert AI recommendations to Real Books
        // Hydration Logic: Convert AI recommendations to Real Books
        // optimization: process in batches to avoid rate limits
        const processRecommendation = async (rec: any) => {
            try {
                // Parallel Strict Search and Fallback Search
                const strictQuery = `intitle:${rec.title} inauthor:${rec.author}`;
                const fallbackQuery = `${rec.title} ${rec.author}`;

                const [strictResults, fallbackResults] = await Promise.all([
                    searchGoogleBooks(strictQuery, 3),
                    searchGoogleBooks(fallbackQuery, 3)
                ]);

                let results = strictResults.length > 0 ? strictResults : fallbackResults;

                if (results.length > 0) {
                    const bestMatch = results[0];
                    const prices = await fetchAllPrices(bestMatch.isbn, bestMatch.id, region);
                    // AI books get a specific reason
                    return { ...bestMatch, prices, explanation: rec.reason } as BookWithPrices & { explanation?: string };
                }
                return null;
            } catch (e) {
                console.error('Hydration failed for:', rec.title, e);
                return null;
            }
        };

        const hydratedAiBooks: (BookWithPrices & { explanation?: string })[] = [];
        console.log(`[MoodAPI] Hydrating ${recommendations.length} recommendations in parallel`);

        try {
            const batchResults = await Promise.all(recommendations.map(processRecommendation));
            hydratedAiBooks.push(...batchResults.filter((b): b is BookWithPrices & { explanation?: string } => b !== null));
        } catch (error) {
            console.error(`[MoodAPI] Hydration completely failed`, error);
        }

        console.log(`[MoodAPI] Hydration complete. Found ${hydratedAiBooks.length} books.`);

        // Fetch prices for direct results
        const directBooksWithPrices = await Promise.all(directResults.map(async (b: any) => {
            const prices = await fetchAllPrices(b.isbn, b.id, region);
            return { ...b, prices, explanation: 'Direct Match' } as BookWithPrices & { explanation?: string };
        }));

        // Context Merge & Deduplication
        const allBooks = [...directBooksWithPrices, ...hydratedAiBooks];
        const uniqueBooks = [];
        const seenIds = new Set();
        const seenTitles = new Set();

        for (const book of allBooks) {
            const normTitle = book.title.toLowerCase().trim();
            if (!seenIds.has(book.id) && !seenTitles.has(normTitle)) {
                uniqueBooks.push(book);
                seenIds.add(book.id);
                seenTitles.add(normTitle);
            }
        }

        const books = uniqueBooks;

        console.log('Final unique books:', books.length);

        // Construct a dynamic explanation since the API doesn't return one anymore
        const explanations = [
            `I found some perfect matches for your request! ✨`,
            `Here are some highly-rated books that match that vibe. 📚`,
            `These picks should be exactly what you're looking for! 💖`,
            `Anika's top selections for "${mood.length > 20 ? 'this mood' : mood}". 🌟`
        ];
        const randomExpl = explanations[Math.floor(Math.random() * explanations.length)];

        const result: MoodSearchResult = {
            books,
            mood,
            aiExplanation: randomExpl,
        };

        return NextResponse.json<ApiResponse<MoodSearchResult>>({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error('Mood search error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to get mood recommendations',
        }, { status: 500 });
    }
}
