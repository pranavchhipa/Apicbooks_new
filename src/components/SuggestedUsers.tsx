'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, UserCheck, Sparkles, Loader2, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { calculateLevel, LEVELS } from '@/lib/gamification';

interface SuggestedUser {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    favorite_genres: string[];
    xp: number;
    matchScore: number;
}

export default function SuggestedUsers({ currentUserId }: { currentUserId: string }) {
    const [users, setUsers] = useState<SuggestedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [followingIds, setFollowingIds] = useState<string[]>([]);
    const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const fetchSuggestions = async () => {
            // 1. Get current user's genres and following list
            const { data: currentUser } = await supabase
                .from('profiles')
                .select('favorite_genres')
                .eq('id', currentUserId)
                .single();

            const { data: following } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentUserId);

            const followingSet = new Set(following?.map(f => f.following_id) || []);
            setFollowingIds(Array.from(followingSet));

            // 2. Get other profiles
            const { data: others } = await supabase
                .from('profiles')
                .select('*')
                .neq('id', currentUserId)
                .limit(20);

            if (!others) {
                setLoading(false);
                return;
            }

            // 3. Calculate Match Scores & Filter Already Following
            const myGenres = currentUser?.favorite_genres || [];

            const processed: SuggestedUser[] = others
                .filter(u => !followingSet.has(u.id)) // Filter out already followed
                .map(u => {
                    const theirGenres = u.favorite_genres || [];
                    let score = 0;
                    if (myGenres.length > 0 && theirGenres.length > 0) {
                        const common = myGenres.filter((g: string) => theirGenres.includes(g));
                        score = Math.round((common.length / Math.max(myGenres.length, theirGenres.length)) * 100);
                    }

                    // Boost score if they have high XP (popular readers)
                    if (u.xp > 1000) score += 10;

                    return {
                        ...u,
                        xp: u.xp || 0,
                        matchScore: Math.min(score, 100) // Cap at 100
                    };
                })
                .sort((a, b) => b.matchScore - a.matchScore) // Sort by match
                .slice(0, 5); // Take top 5

            setUsers(processed);
            setLoading(false);
        };

        fetchSuggestions();
    }, [currentUserId]);

    const handleFollow = async (userId: string) => {
        setLoadingFollow(userId);
        const { error } = await supabase.from('follows').insert({
            follower_id: currentUserId,
            following_id: userId
        });

        if (!error) {
            setFollowingIds(prev => [...prev, userId]);
        }
        setLoadingFollow(null);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="animate-pulse bg-[#141b3d]/40 h-24 rounded-xl" />
                ))}
            </div>
        );
    }

    if (users.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-400" />
                <span>Recommended for You</span>
            </h3>

            <div className="grid gap-4">
                {users.map(user => {
                    const levelKey = calculateLevel(user.xp);
                    const levelInfo = LEVELS[levelKey];

                    return (
                        <div key={user.id} className="flex items-center gap-4 p-4 bg-[#141b3d]/60 border border-[#1e2749] rounded-xl hover:border-accent-500/30 transition-all group">
                            {/* Avatar */}
                            <Link href={`/profile/${user.id}`} className="relative">
                                {user.avatar_url ? (
                                    <Image
                                        src={user.avatar_url}
                                        alt={user.full_name || 'User'}
                                        width={50}
                                        height={50}
                                        className="rounded-full object-cover border-2 border-transparent group-hover:border-accent-500 transition-colors"
                                    />
                                ) : (
                                    <div className="w-[50px] h-[50px] rounded-full bg-slate-800 flex items-center justify-center border-2 border-transparent group-hover:border-accent-500 transition-colors">
                                        <span className="text-xl font-bold text-slate-500">
                                            {user.full_name?.[0] || '?'}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-[#0a0e27] rounded-full p-0.5" title={levelInfo.label}>
                                    <Trophy className={`w-3 h-3 ${levelInfo.color}`} />
                                </div>
                            </Link>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <Link href={`/profile/${user.id}`} className="font-bold text-white hover:underline truncate">
                                        {user.full_name}
                                    </Link>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1e2749] text-slate-300 border border-slate-700">
                                        {levelInfo.label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                    {user.matchScore > 0 && (
                                        <span className="text-xs font-medium text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full">
                                            {user.matchScore}% Match
                                        </span>
                                    )}
                                    {user.favorite_genres?.slice(0, 2).map(g => (
                                        <span key={g} className="text-[10px] text-slate-400">
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Action */}
                            <button
                                onClick={() => handleFollow(user.id)}
                                disabled={followingIds.includes(user.id) || loadingFollow === user.id}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all
                                    ${followingIds.includes(user.id)
                                        ? 'bg-slate-700/50 text-slate-400 cursor-default'
                                        : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    }
                                `}
                            >
                                {loadingFollow === user.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : followingIds.includes(user.id) ? (
                                    <>Following</>
                                ) : (
                                    <>
                                        <UserPlus className="w-3 h-3" />
                                        Follow
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
