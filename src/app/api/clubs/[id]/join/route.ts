import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: clubId } = params;

        // Check if already a member
        const { data: existing } = await supabase
            .from('club_members')
            .select('id')
            .eq('club_id', clubId)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Already a member' }, { status: 400 });
        }

        // Join the club
        const { error } = await supabase.from('club_members').insert({
            club_id: clubId,
            user_id: user.id,
            role: 'member',
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get club name for activity
        const { data: club } = await supabase
            .from('book_clubs')
            .select('name')
            .eq('id', clubId)
            .single();

        // Create activity
        await supabase.from('activity_feed').insert({
            user_id: user.id,
            activity_type: 'club_joined',
            club_id: clubId,
            club_name: club?.name || '',
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to join club' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabase
            .from('club_members')
            .delete()
            .eq('club_id', params.id)
            .eq('user_id', user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to leave club' }, { status: 500 });
    }
}
