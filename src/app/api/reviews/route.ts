import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const bookId = searchParams.get('bookId');
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = supabase
            .from('book_reviews')
            .select('*, author:profiles!book_reviews_user_id_fkey(full_name, avatar_url)')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (bookId) {
            query = query.eq('book_id', bookId);
        }
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: reviews, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ reviews: reviews || [] });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { book_id, book_title, book_cover, book_author, rating, review_text, mood_tags } = body;

        if (!book_id || !book_title) {
            return NextResponse.json({ error: 'Book ID and title are required' }, { status: 400 });
        }

        const { data: review, error } = await supabase
            .from('book_reviews')
            .upsert({
                user_id: user.id,
                book_id,
                book_title,
                book_cover: book_cover || null,
                book_author: book_author || null,
                rating: rating || null,
                review_text: review_text || null,
                mood_tags: mood_tags || [],
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,book_id' })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also update user_books rating if exists
        if (rating) {
            await supabase
                .from('user_books')
                .update({ rating, review: review_text })
                .eq('user_id', user.id)
                .eq('book_id', book_id);
        }

        // Create activity
        await supabase.from('activity_feed').insert({
            user_id: user.id,
            activity_type: 'review_posted',
            book_id,
            book_title,
            book_cover,
            metadata: { rating, review_preview: review_text?.substring(0, 100) },
        });

        return NextResponse.json({ review });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to post review' }, { status: 500 });
    }
}
