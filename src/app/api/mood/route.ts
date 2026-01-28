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

        // Get AI recommendations
        let analysis = await getMoodRecommendations(mood);
        console.log('Got', analysis.recommendations.length, 'recommendations from AI');

        let books: BookWithPrices[] = [];

        // Check if we got the generic fallback (detect by explanation)
        // This happens if the API fails AND the mock keyword matcher found nothing
        // We also check against the known default book list for safety
        // Check if we got the generic fallback (detect by explanation)
        // This happens if the API fails AND the mock keyword matcher found nothing
        // We also check against the known default book list for safety
        const firstBookTitle = analysis.recommendations[0]?.title;
        // const isDefaultList = firstBookTitle && DEFAULT_BOOKS.includes(firstBookTitle);
        // const isGenericExplanation = analysis.explanation.includes("curated a diverse selection of highly acclaimed books");

        // We trigger fallback if it looks generic, unless the user ASKED for something that matches our defaults (like sci-fi)
        // But since our defaults are "Project Hail Mary", if user asked for "sci-fi", these are actually good.
        // So we mainly want to catch when user asks for "underwater basket weaving" and gets Project Hail Mary.
        // const isGenericFallback = isGenericExplanation || (isDefaultList && !mood.toLowerCase().includes('sci-fi'));

        // DIRECT FALLBACK REMOVED: Searching Google Books for the mood string directly (e.g. "romantic")
        // returns random books that happen to have that word in the title/metadata, which leads to poor user experience.
        // We will rely on the AI (or mock data) to provide good specific titles.

        /* 
        if (isGenericFallback) {
             ... (removed logic)
        }
        */

        // If direct search didn't yield results (or wasn't needed), process the AI recommendations
        if (books.length === 0) {
            // Search for each recommended book with fallback queries
            const booksPromises = analysis.recommendations.map(async (rec) => {
                try {
                    // Try primary search: "title author"
                    const primaryQuery = `${rec.title} ${rec.author}`;
                    console.log('Searching for:', primaryQuery);

                    let results = await searchGoogleBooks(primaryQuery, 3);

                    // If no results, try alternative queries
                    if (results.length === 0) {
                        console.log('No results for primary query, trying alternatives...');
                        const alternatives = getAlternativeQueries(rec);

                        for (const altQuery of alternatives) {
                            results = await searchGoogleBooks(altQuery, 3);
                            if (results.length > 0) {
                                console.log('Found with alternative query:', altQuery);
                                break;
                            }
                        }
                    }

                    if (results.length > 0) {
                        // Find the best match (prefer exact title match)
                        const bestMatch = results.find(book =>
                            book.title.toLowerCase().includes(rec.title.toLowerCase().split(':')[0].trim())
                        ) || results[0];

                        const prices = await fetchAllPrices(bestMatch.isbn, bestMatch.id, region);
                        console.log('Found book:', bestMatch.title);
                        return { ...bestMatch, prices } as BookWithPrices;
                    }

                    console.log('Could not find book:', rec.title);
                    return null;
                } catch (error) {
                    console.error('Error searching for book:', rec.title, error);
                    return null;
                }
            });

            const booksWithNulls = await Promise.all(booksPromises);
            books = booksWithNulls.filter((b): b is BookWithPrices => b !== null);
        }

        console.log('Successfully found', books.length, 'books');

        const result: MoodSearchResult = {
            books,
            mood,
            aiExplanation: analysis.explanation,
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
