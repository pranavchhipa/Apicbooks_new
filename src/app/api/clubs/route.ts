import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const genre = searchParams.get('genre');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = supabase
            .from('book_clubs')
            .select('*, creator:profiles!book_clubs_creator_id_fkey(full_name, avatar_url)')
            .eq('is_public', true)
            .order('member_count', { ascending: false })
            .limit(limit);

        if (genre && genre !== 'all') {
            query = query.eq('genre', genre);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data: clubs, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ clubs: clubs || [] });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
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
        const { name, description, genre, is_public, current_book_id, current_book_title, current_book_cover, current_book_author } = body;

        if (!name) {
            return NextResponse.json({ error: 'Club name is required' }, { status: 400 });
        }

        // Create the club
        const { data: club, error: clubError } = await supabase
            .from('book_clubs')
            .insert({
                name,
                description: description || '',
                genre: genre || 'General',
                is_public: is_public !== false,
                creator_id: user.id,
                current_book_id,
                current_book_title,
                current_book_cover,
                current_book_author,
                member_count: 1,
            })
            .select()
            .single();

        if (clubError) {
            return NextResponse.json({ error: clubError.message }, { status: 500 });
        }

        // Add creator as admin member
        await supabase.from('club_members').insert({
            club_id: club.id,
            user_id: user.id,
            role: 'admin',
        });

        // Create activity
        await supabase.from('activity_feed').insert({
            user_id: user.id,
            activity_type: 'club_created',
            club_id: club.id,
            club_name: name,
        });

        return NextResponse.json({ club });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to create club' }, { status: 500 });
    }
}
