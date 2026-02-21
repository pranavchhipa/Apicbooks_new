import { createClient } from '@/lib/supabase/client';

export interface SeriesMetadata {
    seriesName: string | null;
    seriesOrder: number | null;
}

/**
 * Update global series metadata for a book
 */
export async function updateGlobalSeriesMetadata(bookId: string, seriesName: string | null, seriesOrder: number | null) {
    const supabase = createClient();

    // First, check if a record exists for this book
    const { data: existing } = await supabase
        .from('global_book_metadata')
        .select('*')
        .eq('book_id', bookId)
        .single();

    const { data: { user } } = await supabase.auth.getUser();

    let error;

    if (existing) {
        // Update
        const response = await supabase
            .from('global_book_metadata')
            .update({
                series_name: seriesName,
                series_order: seriesOrder,
                updated_at: new Date().toISOString(),
                updated_by: user?.id
            })
            .eq('book_id', bookId);
        error = response.error;
    } else {
        // Insert
        const response = await supabase
            .from('global_book_metadata')
            .insert({
                book_id: bookId,
                series_name: seriesName,
                series_order: seriesOrder,
                updated_at: new Date().toISOString(),
                updated_by: user?.id
            });
        error = response.error;
    }

    if (error) {
        console.error('Error updating global series metadata:', error);
        throw error;
    }

    return true;
}

/**
 * Get global series metadata for a book
 */
export async function getGlobalSeriesMetadata(bookId: string): Promise<SeriesMetadata | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('global_book_metadata')
        .select('series_name, series_order')
        .eq('book_id', bookId)
        .single();

    if (error) {
        // PGRST116 means no rows found, which is fine (no metadata yet)
        if (error.code !== 'PGRST116') {
            console.error('Error fetching global series metadata:', error);
        }
        return null;
    }

    return {
        seriesName: data.series_name,
        seriesOrder: data.series_order
    };
}
