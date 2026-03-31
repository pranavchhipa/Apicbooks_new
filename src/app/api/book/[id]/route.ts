import { NextRequest, NextResponse } from 'next/server';
import { fetchAllPrices } from '@/lib/api/prices';
import { getUnifiedBookDetails } from '@/lib/api/unified';
import type { ApiResponse } from '@/types';
import { createClient } from '@/lib/supabase/server';

/**
 * Build a book response from a local Supabase `books` row when google_id is null.
 */
function buildLocalBookResponse(dbRow: any) {
    return {
        id: dbRow.id,
        title: dbRow.title || 'Untitled',
        authors: dbRow.authors || [],
        description: dbRow.description || '',
        coverUrl: dbRow.cover_url || '',
        isbn: dbRow.isbn || '',
        pageCount: dbRow.page_count || 0,
        publishedDate: dbRow.published_date || '',
        categories: dbRow.categories || [],
        language: dbRow.language || 'en',
        prices: [],
        createdAt: dbRow.created_at || new Date().toISOString(),
        updatedAt: dbRow.updated_at || new Date().toISOString(),
    };
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const bookId = params.id;

    if (!bookId) {
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Book ID is required',
        }, { status: 400 });
    }

    try {
        // Resolve UUID to Google ID if necessary
        let queryId = bookId;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId);

        if (isUuid) {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('id', bookId)
                .single();

            console.log('[BookAPI] UUID lookup result:', { bookId, hasData: !!data, error: error?.message, googleId: data?.google_id });

            if (!error && data?.google_id) {
                // Has a Google ID — try Google Books API first, fall back to local DB
                queryId = data.google_id;

                const bookData = await getUnifiedBookDetails(queryId);
                if (bookData) {
                    // Google API succeeded — enrich with prices and return
                    const url = new URL(request.url);
                    const region = url.searchParams.get('region') || 'IN';
                    const prices = await fetchAllPrices(bookData.isbn || '0000000000', bookId, region, bookData.title, bookData.authors?.[0]);
                    return NextResponse.json<ApiResponse<any>>({
                        success: true,
                        data: { book: { ...bookData, prices, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
                    }, {
                        headers: {
                            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                        }
                    });
                } else {
                    // Google API failed — fall back to local DB
                    console.log('[BookAPI] Google API failed for', queryId, '— serving from local DB');
                    return NextResponse.json<ApiResponse<any>>({
                        success: true,
                        data: { book: buildLocalBookResponse(data) },
                    }, {
                        headers: {
                            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                        }
                    });
                }
            } else if (!error && data) {
                // No google_id (manually added book) — serve from local DB
                console.log('[BookAPI] Serving local book (no google_id):', data.title);
                return NextResponse.json<ApiResponse<any>>({
                    success: true,
                    data: { book: buildLocalBookResponse(data) },
                }, {
                    headers: {
                        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                    }
                });
            }
            // If error or not found, fall through to Google Books lookup
        }

        // Use the Unified Data Service to get enriched book data
        const bookData = await getUnifiedBookDetails(queryId);

        if (!bookData) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Book not found',
            }, { status: 404 });
        }

        // Get Region from query or default to 'IN' (Requested by user: "set default currency to inr only for all")
        const url = new URL(request.url);
        const region = url.searchParams.get('region') || 'IN';

        // Fetch prices (mock for now, but could be real APIs later)
        const prices = await fetchAllPrices(bookData.isbn || '0000000000', bookId, region, bookData.title, bookData.authors?.[0]);

        const book = {
            ...bookData,
            prices,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json<ApiResponse<any>>({
            success: true,
            data: { book },
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            }
        });

    } catch (error) {
        console.error('Book fetch error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to fetch book details',
        }, { status: 500 });
    }
}
