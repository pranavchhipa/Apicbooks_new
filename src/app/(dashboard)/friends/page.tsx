'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, UserPlus, UserCheck, Search } from 'lucide-react';
import UserSearch, { FollowList } from '@/components/UserSearch';
import SuggestedUsers from '@/components/SuggestedUsers';
import SectionGuideButton from '@/components/dashboard/SectionGuideButton';


type Tab = 'find' | 'following' | 'followers';

export default function FriendsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('find');
    const [userId, setUserId] = useState<string | null>(null);
    const [stats, setStats] = useState({ following: 0, followers: 0 });

    const supabase = createClient();

    useEffect(() => {
        const fetchUserAndStats = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);

                // Step 1: Get raw follows
                const { data: followingData } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', user.id);

                const { data: followersData } = await supabase
                    .from('follows')
                    .select('follower_id')
                    .eq('following_id', user.id);

                let realFollowingCount = 0;
                let realFollowersCount = 0;

                // Step 2: Validate against profiles (exclude ghosts)
                if (followingData?.length) {
                    const ids = followingData.map(f => f.following_id);
                    const { count } = await supabase
                        .from('profiles')
                        .select('id', { count: 'exact', head: true })
                        .in('id', ids);
                    realFollowingCount = count || 0;
                }

                if (followersData?.length) {
                    const ids = followersData.map(f => f.follower_id);
                    const { count } = await supabase
                        .from('profiles')
                        .select('id', { count: 'exact', head: true })
                        .in('id', ids);
                    realFollowersCount = count || 0;
                }

                setStats({
                    following: realFollowingCount,
                    followers: realFollowersCount
                });
            }
        };

        fetchUserAndStats();
    }, []);

    const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
        { key: 'find', label: 'Find Readers', icon: <Search className="w-4 h-4" /> },
        { key: 'following', label: 'Following', icon: <UserCheck className="w-4 h-4" />, count: stats.following },
        { key: 'followers', label: 'Followers', icon: <Users className="w-4 h-4" />, count: stats.followers },
    ];

    if (!userId) {
        return (
            <div className="max-w-4xl mx-auto animate-pulse">
                <div className="h-8 bg-slate-700 rounded w-1/3 mb-6" />
                <div className="h-64 bg-slate-700/30 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-accent-500/20 border border-accent-500/30">
                        <Users className="w-6 h-6 text-accent-400" />
                    </span>
                    <span className="gradient-text">Community</span>
                    <SectionGuideButton section="community" />
                </h1>
                <p className="text-slate-400 mt-2">Join the circle of readers</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary-500/10 to-primary-600/5 border border-primary-500/20 rounded-2xl p-6 text-center">
                    <p className="text-3xl font-bold text-white">{stats.following}</p>
                    <p className="text-sm text-slate-400">Following</p>
                </div>
                <div className="bg-gradient-to-br from-accent-500/10 to-accent-600/5 border border-accent-500/20 rounded-2xl p-6 text-center">
                    <p className="text-3xl font-bold text-white">{stats.followers}</p>
                    <p className="text-sm text-slate-400">Followers</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-[#0a0e27]/50 border border-[#1e2749] rounded-xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                            ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/10 text-white border border-primary-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-700 text-xs">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6">
                {activeTab === 'find' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Search className="w-4 h-4 text-slate-400" />
                                <span>Search All</span>
                            </h3>
                            <UserSearch currentUserId={userId} />
                        </div>
                    </div>
                )}
                {activeTab === 'following' && (
                    <FollowList userId={userId} type="following" />
                )}
                {activeTab === 'followers' && (
                    <FollowList userId={userId} type="followers" />
                )}
            </div>

            {/* Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-accent-500/10 to-primary-500/10 border border-accent-500/20 rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-2">👥 Why follow readers?</h3>
                    <ul className="text-slate-400 text-sm space-y-2">
                        <li>• See what books your friends are reading</li>
                        <li>• Get book recommendations based on their activity</li>
                        <li>• Build your reading community</li>
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/30 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-white font-semibold mb-2">💌 Invite Friends</h3>
                        <p className="text-slate-300 text-sm mb-4">
                            Know someone who loves books? Invite them to ApicBooks!
                        </p>
                        <button className="px-4 py-2 bg-white text-primary-600 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors shadow-lg">
                            Copy Invite Link
                        </button>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-32 h-32 text-white transform translate-x-8 translate-y-8" />
                    </div>
                </div>
            </div>
        </div>
    );
}
