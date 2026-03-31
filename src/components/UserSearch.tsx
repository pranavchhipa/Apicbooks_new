'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, UserPlus, UserMinus, User, Users, Loader2, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { calculateLevel, LEVELS } from '@/lib/gamification';

interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    xp?: number; // Optional as not in DB yet
}

interface UserSearchProps {
    currentUserId: string;
}

export default function UserSearch({ currentUserId }: UserSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserProfile[]>([]);
    const [followingIds, setFollowingIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

    const supabase = createClient();

    // Load who current user is following
    useEffect(() => {
        const fetchFollowing = async () => {
            const { data } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentUserId);

            if (data) {
                setFollowingIds(data.map(f => f.following_id));
            }
        };

        if (currentUserId) fetchFollowing();
    }, [currentUserId]);

    // Load initial users
    useEffect(() => {
        const fetchInitial = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, bio')
                .neq('id', currentUserId)
                .limit(20);

            if (data) {
                // DEBUG: Show ALL users locally to see what we have
                console.log('All Profiles:', data);
                setResults(data);
            }
        };
        fetchInitial();
    }, [currentUserId]);

    // Search users
    const handleSearch = async () => {
        if (!query.trim()) {
            // Re-fetch initial if empty
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, bio')
                .neq('id', currentUserId)
                .limit(20);
            if (data) setResults(data);
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, bio')
            .ilike('full_name', `%${query}%`)
            .neq('id', currentUserId)
            .limit(10);

        if (error) {
            console.error('Search error:', error);
        } else {
            // Relaxed Filter: Allow users even if name is seemingly empty, just to DEBUG.
            // We will visually flag them in the UI if name is missing.
            setResults(data || []);
        }

        setLoading(false);
    };

    // Follow user
    const handleFollow = async (userId: string) => {
        setLoadingFollow(userId);

        const { error } = await supabase
            .from('follows')
            .insert({
                follower_id: currentUserId,
                following_id: userId
            });

        if (!error) {
            setFollowingIds(prev => [...prev, userId]);
        }

        setLoadingFollow(null);
    };

    // Unfollow user
    const handleUnfollow = async (userId: string) => {
        setLoadingFollow(userId);

        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', currentUserId)
            .eq('following_id', userId);

        if (!error) {
            setFollowingIds(prev => prev.filter(id => id !== userId));
        }

        setLoadingFollow(null);
    };

    const isFollowing = (userId: string) => followingIds.includes(userId);

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search readers by name..."
                    className="w-full pl-12 pr-4 py-3 bg-background dark:bg-[#0c0a14] border border-card-border rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
            </div>

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-2">
                    {results.map((user) => {
                        const levelKey = calculateLevel(user.xp || 0);
                        const levelInfo = LEVELS[levelKey];

                        return (
                            <div
                                key={user.id}
                                className="flex items-center gap-4 p-4 bg-[#141b3d]/40 backdrop-blur-md border border-card-border rounded-xl hover:border-primary-500/30 hover:bg-[#141b3d]/60 hover:shadow-lg hover:shadow-primary-500/5 transition-all group"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    {user.avatar_url ? (
                                        <Image
                                            src={user.avatar_url}
                                            alt={user.full_name || 'User'}
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                            <User className="w-6 h-6 text-foreground" />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 bg-[#0a0e27] rounded-full p-0.5" title={levelInfo.label}>
                                        <Trophy className={`w-3 h-3 ${levelInfo.color}`} />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-foreground truncate">
                                            {user.full_name || 'Anonymous'}
                                        </h4>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-elevated text-foreground/80 border border-slate-700">
                                            {levelInfo.label}
                                        </span>
                                    </div>
                                    {user.bio && (
                                        <p className="text-sm text-muted-foreground line-clamp-1">{user.bio}</p>
                                    )}
                                </div>

                                {/* Follow Button */}
                                <button
                                    onClick={() => isFollowing(user.id) ? handleUnfollow(user.id) : handleFollow(user.id)}
                                    disabled={loadingFollow === user.id}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isFollowing(user.id)
                                        ? 'bg-slate-700 text-foreground/80 hover:bg-red-500/20 hover:text-red-400'
                                        : 'bg-primary-500 text-white hover:bg-primary-600'
                                        }`}
                                >
                                    {loadingFollow === user.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : isFollowing(user.id) ? (
                                        <>
                                            <UserMinus className="w-4 h-4" />
                                            Following
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Follow
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {query && results.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No readers found matching "{query}"</p>
                    <p className="text-xs mt-2">Try searching shorter names.</p>
                </div>
            )}
            {!query && results.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-500">
                    <p>No other users found.</p>
                    <p className="text-xs mt-2 text-slate-600">If you know users exist, check Database RLS policies.</p>
                </div>
            )}
        </div>
    );
}

// Component to show following/followers list
export function FollowList({ userId, type }: { userId: string; type: 'following' | 'followers' }) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);

            try {
                if (type === 'following') {
                    // Step 1: Get Update IDs
                    console.log('FollowList: Fetching following for', userId);
                    const { data: followRows, error: followError } = await supabase
                        .from('follows')
                        .select('following_id')
                        .eq('follower_id', userId);

                    if (followError) {
                        console.error('FollowList Error fetching following IDs:', followError);
                    } else if (followRows && followRows.length > 0) {
                        console.log('FollowList: Found follow rows:', followRows);
                        // Step 2: Get Profiles
                        const ids = followRows.map(r => r.following_id);
                        const { data: profiles, error: profileError } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url, bio')
                            .in('id', ids);

                        if (profileError) console.error('FollowList Error fetching following profiles:', profileError);
                        console.log('FollowList: Found profiles:', profiles);
                        if (profiles) setUsers(profiles);
                    } else {
                        console.log('FollowList: No follow rows found');
                        setUsers([]);
                    }
                } else {
                    // Step 1: Get Update IDs
                    const { data: followerRows, error: followerError } = await supabase
                        .from('follows')
                        .select('follower_id')
                        .eq('following_id', userId);

                    if (followerError) {
                        console.error('Error fetching follower IDs:', followerError);
                    } else if (followerRows && followerRows.length > 0) {
                        // Step 2: Get Profiles
                        const ids = followerRows.map(r => r.follower_id);
                        const { data: profiles, error: profileError } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url, bio')
                            .in('id', ids);

                        if (profileError) console.error('Error fetching follower profiles:', profileError);
                        if (profiles) setUsers(profiles);
                    } else {
                        setUsers([]);
                    }
                }
            } catch (err) {
                console.error('Unexpected error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchUsers();
    }, [userId, type]);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-3 p-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-1/2" />
                            <div className="h-3 bg-slate-700/50 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>{type === 'following' ? 'Not following anyone yet' : 'No followers yet'}</p>
                {/* Debug hint: if real follows exist but profiles don't, users might be confused. 
                    We can't easily check 'real follows' count here without re-fetching or prop.
                    But we console.warned it above.
                */}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {users.map((user) => {
                const levelKey = calculateLevel(user.xp || 0); // Default to 0 if null
                const levelInfo = LEVELS[levelKey];

                return (
                    <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#141b3d]/20 border border-transparent hover:border-primary-500/20 hover:bg-[#141b3d]/40 transition-all group"
                    >
                        <div className="relative">
                            {user.avatar_url ? (
                                <Image
                                    src={user.avatar_url}
                                    alt={user.full_name || 'User'}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                    <User className="w-5 h-5 text-foreground" />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-[#0a0e27] rounded-full p-0.5" title={levelInfo.label}>
                                <Trophy className={`w-3 h-3 ${levelInfo.color}`} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium text-foreground truncate">
                                    {user.full_name || 'Anonymous'}
                                </h4>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-elevated text-foreground/80 border border-slate-700">
                                    {levelInfo.label}
                                </span>
                            </div>
                            {user.bio && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{user.bio}</p>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
