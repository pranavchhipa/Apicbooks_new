'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, UserPlus, Search, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfile {
    id: string;
    full_name: string;
    avatar_url: string;
    bio: string;
}

interface Activity {
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

export default function FriendsPage() {
    const [following, setFollowing] = useState<UserProfile[]>([]);
    const [suggested, setSuggested] = useState<UserProfile[]>([]);
    const [feed, setFeed] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [activeTab, setActiveTab] = useState<'feed' | 'following' | 'find'>('feed');
    const supabase = createClient();

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: friendships } = await supabase
            .from('friendships')
            .select('following_id')
            .eq('follower_id', user.id);

        const followingIds = friendships?.map(f => f.following_id) || [];

        if (followingIds.length > 0) {
            const { data: profiles } = await supabase.from('profiles').select('*').in('id', followingIds);
            setFollowing(profiles || []);
        }

        const allIds = [...followingIds, user.id];
        const { data: activities } = await supabase
            .from('activity_feed')
            .select('*, user:profiles!activity_feed_user_id_fkey(full_name, avatar_url)')
            .in('user_id', allIds)
            .order('created_at', { ascending: false })
            .limit(30);
        setFeed(activities || []);

        const { data: allProfiles } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user.id)
            .limit(10);
        setSuggested((allProfiles || []).filter(p => !followingIds.includes(p.id)));

        setLoading(false);
    }

    async function followUser(userId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('friendships').insert({ follower_id: user.id, following_id: userId });
        fetchData();
    }

    async function searchUsers() {
        if (!searchQuery.trim()) return;
        const { data } = await supabase.from('profiles').select('*').ilike('full_name', `%${searchQuery}%`).limit(20);
        setSearchResults(data || []);
    }

    function getActivityText(a: Activity) {
        switch (a.activity_type) {
            case 'book_added': return `added "${a.book_title}" to their shelf`;
            case 'book_finished': return `finished "${a.book_title}"`;
            case 'review_posted': return `reviewed "${a.book_title}"`;
            case 'club_joined': return `joined ${a.club_name}`;
            case 'club_created': return `created club: ${a.club_name}`;
            default: return 'was active';
        }
    }

    function timeAgo(date: string) {
        const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (s < 60) return 'just now';
        if (s < 3600) return `${Math.floor(s / 60)}m`;
        if (s < 86400) return `${Math.floor(s / 3600)}h`;
        return `${Math.floor(s / 86400)}d`;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Community</h1>
                <p className="text-white/40 mt-1">See what your friends are reading</p>
            </div>

            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-full w-fit mb-8">
                {(['feed', 'following', 'find'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-white/40 hover:text-white border border-transparent'}`}>
                        {tab === 'find' ? 'Find Readers' : tab}
                    </button>
                ))}
            </div>

            {activeTab === 'feed' && (
                <div className="space-y-4">
                    {feed.length === 0 ? (
                        <div className="text-center py-16 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06]">
                            <Users className="w-14 h-14 text-white/20 mx-auto mb-4" />
                            <h3 className="text-xl font-display font-semibold text-white mb-2">Your feed is empty</h3>
                            <p className="text-white/40 mb-6">Follow readers to see their activity</p>
                            <button onClick={() => setActiveTab('find')} className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors">Find Readers</button>
                        </div>
                    ) : feed.map(activity => (
                        <div key={activity.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                                {activity.user?.avatar_url ? (
                                    <Image src={activity.user.avatar_url} alt="" width={36} height={36} className="rounded-full" />
                                ) : (
                                    <span className="text-sm font-medium text-amber-400">{activity.user?.full_name?.[0] || '?'}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="font-medium text-white">{activity.user?.full_name}</span>{' '}
                                    <span className="text-white/60">{getActivityText(activity)}</span>
                                </p>
                                <p className="text-xs text-white/30 mt-1">{timeAgo(activity.created_at)}</p>
                                {activity.book_cover && (
                                    <div className="mt-3">
                                        <Image src={activity.book_cover} alt={activity.book_title || ''} width={60} height={90} className="rounded-lg shadow-book" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'following' && (
                <div>
                    {following.length === 0 ? (
                        <div className="text-center py-16 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06]">
                            <UserPlus className="w-14 h-14 text-white/20 mx-auto mb-4" />
                            <h3 className="text-xl font-display text-white mb-2">Not following anyone yet</h3>
                            <button onClick={() => setActiveTab('find')} className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors mt-4">Find Readers</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {following.map(p => (
                                <Link href={`/profile/${p.id}`} key={p.id} className="flex items-center gap-3 p-4 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all">
                                    <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center">
                                        {p.avatar_url ? <Image src={p.avatar_url} alt="" width={48} height={48} className="rounded-full" /> : <span className="font-medium text-amber-400">{p.full_name?.[0]}</span>}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{p.full_name}</p>
                                        {p.bio && <p className="text-xs text-white/30 line-clamp-1">{p.bio}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'find' && (
                <div>
                    <div className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input type="text" placeholder="Search readers by name..." value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchUsers()}
                                className="input-field pl-11" />
                        </div>
                        <button onClick={searchUsers} className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors">Search</button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mb-8 space-y-3">
                            <h3 className="font-display font-semibold text-white">Results</h3>
                            {searchResults.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                                            <span className="text-sm font-medium text-amber-400">{p.full_name?.[0]}</span>
                                        </div>
                                        <p className="font-medium text-white">{p.full_name}</p>
                                    </div>
                                    <button onClick={() => followUser(p.id)} className="text-sm px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/60 hover:text-white hover:border-white/[0.12] transition-all">Follow</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {suggested.length > 0 && (
                        <div>
                            <h3 className="font-display font-semibold text-white mb-4">Suggested Readers</h3>
                            <div className="space-y-3">
                                {suggested.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                                                <span className="text-sm font-medium text-amber-400">{p.full_name?.[0]}</span>
                                            </div>
                                            <p className="font-medium text-white">{p.full_name}</p>
                                        </div>
                                        <button onClick={() => followUser(p.id)} className="text-sm px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/60 hover:text-white hover:border-white/[0.12] transition-all">Follow</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
