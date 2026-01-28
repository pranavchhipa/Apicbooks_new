'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import {
    User,
    MapPin,
    Calendar,
    BookOpen,
    Star,
    Flame,
    Trophy,
    UserPlus,
    UserCheck,
    Loader2,
    ArrowLeft,
    Quote
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { UserProfile, getUserProfile } from '@/lib/api/user';
import { calculateLevel, LEVELS } from '@/lib/gamification';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const targetUserId = params.id as string;

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [stats, setStats] = useState({ read: 0, reviews: 0, streak: 0 });

    const supabase = createClient();

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            const userProfile = await getUserProfile(targetUserId);
            if (!userProfile) {
                setLoading(false);
                return;
            }
            setProfile(userProfile);

            // Fetch summary stats only
            const [readRes, reviewsRes] = await Promise.all([
                supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId).eq('status', 'completed'),
                supabase.from('user_library').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId).not('rating', 'is', null)
            ]);

            setStats({
                read: readRes.count || 0,
                reviews: reviewsRes.count || 0,
                streak: userProfile?.current_streak || 0
            });

            if (user) {
                const { data: followData } = await supabase
                    .from('follows')
                    .select('*')
                    .eq('follower_id', user.id)
                    .eq('following_id', targetUserId)
                    .single();
                setIsFollowing(!!followData);
            }

            setLoading(false);
        };
        getData();
    }, [targetUserId]);

    const handleFollowToggle = async () => {
        if (!currentUser) return;
        setFollowLoading(true);
        if (isFollowing) {
            await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', targetUserId);
            setIsFollowing(false);
        } else {
            await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: targetUserId });
            setIsFollowing(true);
        }
        setFollowLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <h1 className="text-xl font-bold text-white mb-2">User not found</h1>
                <Link href="/friends" className="px-6 py-2 bg-primary-500 text-white rounded-xl">Back</Link>
            </div>
        );
    }

    const levelKey = calculateLevel(profile.xp || 0);
    const levelInfo = LEVELS[levelKey];
    const isMe = currentUser?.id === targetUserId;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 animate-scale-in">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Community
            </button>

            {/* Profile Card */}
            <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-3xl overflow-hidden relative shadow-2xl">
                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px]" />

                <div className="relative z-10 p-8 flex flex-col items-center text-center">
                    {/* Level Badge */}
                    <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-[#0a0e27]/80 border border-slate-700 backdrop-blur-sm text-xs text-slate-300 font-medium flex items-center gap-1.5">
                        <Trophy className={`w-3 h-3 ${levelInfo.color}`} />
                        {levelInfo.label}
                    </div>

                    {/* Avatar */}
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full border-4 border-[#0a0e27] shadow-xl overflow-hidden bg-slate-800 p-1">
                            {profile.avatar_url ? (
                                <Image src={profile.avatar_url} alt={profile.full_name || 'User'} fill className="object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500 text-4xl font-bold text-white">
                                    {(profile.full_name?.[0] || 'U').toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name & Bio */}
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {profile.full_name || 'Anonymous Reader'}
                    </h1>

                    <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-6">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {profile.location || "Earth"}
                        </div>
                        {profile.created_at && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Member since {new Date(profile.created_at).getFullYear()}
                            </div>
                        )}
                    </div>

                    {profile.bio && (
                        <div className="max-w-md bg-[#0a0e27]/30 rounded-xl p-4 mb-8 border border-[#1e2749]/50">
                            <Quote className="w-4 h-4 text-slate-600 mb-2 mx-auto opacity-50" />
                            <p className="text-slate-300 text-sm leading-relaxed italic">
                                "{profile.bio}"
                            </p>
                        </div>
                    )}

                    {/* Favorite Genres */}
                    {profile.favorite_genres && profile.favorite_genres.length > 0 && (
                        <div className="mb-8">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Interests</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {profile.favorite_genres.map(g => (
                                    <span key={g} className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-300 rounded-full text-xs font-medium">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Simple Stats Row */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-8">
                        <div className="bg-[#0a0e27]/40 rounded-xl p-3 border border-[#1e2749]">
                            <BookOpen className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-white">{stats.read}</div>
                            <div className="text-[10px] text-slate-400 uppercase">Books</div>
                        </div>
                        <div className="bg-[#0a0e27]/40 rounded-xl p-3 border border-[#1e2749]">
                            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-white">{stats.streak}</div>
                            <div className="text-[10px] text-slate-400 uppercase">Streak</div>
                        </div>
                        <div className="bg-[#0a0e27]/40 rounded-xl p-3 border border-[#1e2749]">
                            <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-white">{stats.reviews}</div>
                            <div className="text-[10px] text-slate-400 uppercase">Reviews</div>
                        </div>
                    </div>

                    {/* Action Button */}
                    {!isMe && (
                        <button
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                            className={`w-full max-w-xs py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-95 ${isFollowing
                                ? 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
                                : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90'
                                }`}
                        >
                            {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? (
                                <>
                                    <UserCheck className="w-4 h-4" /> Following
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" /> Follow Reader
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
