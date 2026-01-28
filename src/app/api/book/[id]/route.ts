import { NextRequest, NextResponse } from 'next/server';
import { fetchAllPrices } from '@/lib/api/prices';
import { getUnifiedBookDetails } from '@/lib/api/unified';
import type { ApiResponse } from '@/types';
import { createClient } from '@/lib/supabase/client';

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
            const supabase = createClient();
            const { data, error } = await supabase
                .from('books')
                .select('google_id')
                .eq('id', bookId)
                .single();

            if (!error && data?.google_id) {
                queryId = data.google_id;
            }
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
        });

    } catch (error) {
        console.error('Book fetch error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to fetch book details',
        }, { status: 500 });
    }
}
