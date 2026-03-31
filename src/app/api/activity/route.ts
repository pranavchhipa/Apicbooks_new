import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '30');
        const userId = searchParams.get('userId');

        let query = supabase
            .from('activity_feed')
            .select('*, user:profiles!activity_feed_user_id_fkey(full_name, avatar_url)')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (userId) {
            // Get activity from user and people they follow
            const { data: following } = await supabase
                .from('friendships')
                .select('following_id')
                .eq('follower_id', userId);

            const followingIds = following?.map(f => f.following_id) || [];
            followingIds.push(userId);

            query = query.in('user_id', followingIds);
        }

        const { data: activities, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ activities: activities || [] });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
    }
}
