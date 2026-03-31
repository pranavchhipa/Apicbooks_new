import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();

        const { data: discussions, error } = await supabase
            .from('club_discussions')
            .select('*, author:profiles!club_discussions_user_id_fkey(full_name, avatar_url)')
            .eq('club_id', params.id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ discussions: discussions || [] });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, chapter, is_spoiler } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const { data: discussion, error } = await supabase
            .from('club_discussions')
            .insert({
                club_id: params.id,
                user_id: user.id,
                title,
                content,
                chapter: chapter || null,
                is_spoiler: is_spoiler || false,
            })
            .select('*, author:profiles!club_discussions_user_id_fkey(full_name, avatar_url)')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Create activity
        const { data: club } = await supabase
            .from('book_clubs')
            .select('name')
            .eq('id', params.id)
            .single();

        await supabase.from('activity_feed').insert({
            user_id: user.id,
            activity_type: 'discussion_posted',
            club_id: params.id,
            club_name: club?.name || '',
            metadata: { discussion_title: title },
        });

        return NextResponse.json({ discussion });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 });
    }
}
