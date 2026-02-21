import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { searchGoogleBooks } from '@/lib/api/google-books';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const seriesName = searchParams.get('seriesName');
    const currentOrderStr = searchParams.get('currentOrder');

    if (!seriesName || !currentOrderStr) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const currentOrder = parseFloat(currentOrderStr);
    const nextOrder = currentOrder + 1;

    // 1. Check Local DB
    const supabase = createClient();
    const { data: localBook } = await supabase
        .from('books')
        .select('*')
        .eq('series_name', seriesName)
        .eq('series_order', nextOrder)
        .limit(1)
        .single();

    if (localBook) {
        return NextResponse.json({ success: true, data: localBook });
    }

    // 2. Search Google Books
    try {
        const query = `intitle:"${seriesName}" "Book ${nextOrder}"`;
        const results = await searchGoogleBooks(query, 3);

        // Filter for reasonable match
        // We look for the series name and the order in the result
        // But Google Books search is fuzzy.
        // Let's rely on the first good result that looks like it belongs to the series.
        // Or simply trust the search if we are specific.

        if (results.length > 0) {
            // Return the first match
            // We might want to "ensure" it exists in our DB later when added, 
            // but for now just return the Google Book data (mapped to our domain).
            return NextResponse.json({ success: true, data: results[0] });
        }
    } catch (error) {
        console.error('Error searching next in series:', error);
    }

    return NextResponse.json({ success: false, error: 'Not found' });
}
