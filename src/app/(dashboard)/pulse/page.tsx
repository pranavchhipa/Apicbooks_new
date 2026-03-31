'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Activity, Users, Globe, UserCheck } from 'lucide-react';
import Image from 'next/image';

interface FeedActivity {
    id: string;
    user_id: string;
    activity_type: string;
    book_title: string;
    book_cover: string;
    club_name: string;
    metadata: any;
    created_at: string;
    user?: { full_name: string; avatar_url: string };
}

type FeedFilter = 'all' | 'following' | 'me';

export default function FeedPage() {
    const [filter, setFilter] = useState<FeedFilter>('all');
    const [activities, setActivities] = useState<FeedActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string>('');
    const supabase = createClient();

    useEffect(() => { fetchData(); }, [filter]);

    async function fetchData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        let query = supabase
            .from('activity_feed')
            .select('*, user:profiles!activity_feed_user_id_fkey(full_name, avatar_url)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (filter === 'me') {
            query = query.eq('user_id', user.id);
        } else if (filter === 'following') {
            const { data: friendships } = await supabase.from('friendships').select('following_id').eq('follower_id', user.id);
            const ids = friendships?.map(f => f.following_id) || [];
            ids.push(user.id);
            query = query.in('user_id', ids);
        }

        const { data } = await query;
        setActivities(data || []);
        setLoading(false);
    }

    function getActivityText(a: FeedActivity) {
        switch (a.activity_type) {
            case 'book_added': return `added "${a.book_title}" to their shelf`;
            case 'book_finished': return `finished reading "${a.book_title}"`;
            case 'review_posted': return `reviewed "${a.book_title}"`;
            case 'rating_given': return `rated "${a.book_title}"`;
            case 'club_joined': return `joined ${a.club_name}`;
            case 'club_created': return `created club: ${a.club_name}`;
            case 'discussion_posted': return `posted in ${a.club_name}`;
            case 'folio_created': return 'created a new folio';
            default: return 'was active';
        }
    }

    function timeAgo(date: string) {
        const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (s < 60) return 'just now';
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Pulse</h1>
                <p className="text-white/40 mt-1">The heartbeat of the reading community</p>
            </div>

            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-full w-fit mb-8">
                {([
                    { key: 'all' as const, label: 'Everyone', icon: Globe },
                    { key: 'following' as const, label: 'Following', icon: UserCheck },
                    { key: 'me' as const, label: 'My Activity', icon: Users },
                ]).map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${filter === f.key ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-white/40 hover:text-white border border-transparent'}`}>
                        <f.icon className="w-3.5 h-3.5" />
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 animate-pulse"><div className="h-12 bg-white/[0.06] rounded" /></div>
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06]">
                    <Activity className="w-14 h-14 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-display text-white mb-2">No activity yet</h3>
                    <p className="text-white/40">Start reading and your activity will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map(a => (
                        <div key={a.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                                {a.user?.avatar_url ? (
                                    <Image src={a.user.avatar_url} alt="" width={36} height={36} className="rounded-full" />
                                ) : (
                                    <span className="text-sm font-medium text-amber-400">{a.user?.full_name?.[0] || '?'}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="font-medium text-white">{a.user?.full_name}</span>{' '}
                                    <span className="text-white/60">{getActivityText(a)}</span>
                                </p>
                                <p className="text-xs text-white/30 mt-1">{timeAgo(a.created_at)}</p>
                                {a.book_cover && (
                                    <div className="mt-3">
                                        <Image src={a.book_cover} alt={a.book_title || ''} width={60} height={90} className="rounded-lg shadow-book" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
