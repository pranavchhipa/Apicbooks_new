'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Activity, Users, Globe, UserCheck } from 'lucide-react';
import SectionGuideButton from '@/components/dashboard/SectionGuideButton';
import ActivityFeed from '@/components/ActivityFeed';

type FeedFilter = 'all' | 'following' | 'me';

export default function FeedPage() {
    const [filter, setFilter] = useState<FeedFilter>('following');
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [followingIds, setFollowingIds] = useState<string[]>([]);

    const supabase = createClient();

    useEffect(() => {
        const fetchUserAndFollowing = async () => {
            // ... existing logic ...
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);

                // Get list of users this person follows
                const { data: follows } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', user.id);

                if (follows) {
                    setFollowingIds(follows.map(f => f.following_id));
                }
            }
        };

        fetchUserAndFollowing();
    }, []);

    const filters: { key: FeedFilter; label: string; icon: React.ReactNode }[] = [
        { key: 'following', label: 'Following', icon: <UserCheck className="w-4 h-4" /> },
        { key: 'me', label: 'My Activity', icon: <Users className="w-4 h-4" /> },
        { key: 'all', label: 'Everyone', icon: <Globe className="w-4 h-4" /> },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground dark:text-white flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 border border-primary-500/20 dark:border-primary-500/30">
                            <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </span>
                        <span className="gradient-text">Pulse</span>
                        <SectionGuideButton section="pulse" />
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">The heartbeat of the community</p>
                </div>
            </div>

            {/* ... (Filter Tabs and Feed) ... */}

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-secondary dark:bg-[#0c0a14]/50 border border-card-border rounded-xl w-fit">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${filter === f.key
                            ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/10 text-primary-600 dark:text-white border border-primary-500/30'
                            : 'text-slate-500 dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        {f.icon}
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Activity Feed */}
            <div className="bg-white/80 dark:bg-card backdrop-blur-xl border border-card-border rounded-2xl p-6">
                <ActivityFeed
                    userId={filter === 'me' ? userId : undefined}
                    followingIds={filter === 'following' ? followingIds : undefined}
                    showHeader={false}
                    limit={50}
                />
            </div>
        </div>
    );
}
