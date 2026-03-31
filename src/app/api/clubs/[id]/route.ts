import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const { id } = params;

        const { data: club, error } = await supabase
            .from('book_clubs')
            .select('*, creator:profiles!book_clubs_creator_id_fkey(full_name, avatar_url)')
            .eq('id', id)
            .single();

        if (error || !club) {
            return NextResponse.json({ error: 'Club not found' }, { status: 404 });
        }

        // Get members
        const { data: members } = await supabase
            .from('club_members')
            .select('*, profile:profiles!club_members_user_id_fkey(full_name, avatar_url)')
            .eq('club_id', id)
            .limit(20);

        // Get discussions
        const { data: discussions } = await supabase
            .from('club_discussions')
            .select('*, author:profiles!club_discussions_user_id_fkey(full_name, avatar_url)')
            .eq('club_id', id)
            .order('created_at', { ascending: false })
            .limit(20);

        return NextResponse.json({ club, members: members || [], discussions: discussions || [] });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch club' }, { status: 500 });
    }
}
