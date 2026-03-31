'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Star, CheckCircle, Heart, Clock, User, Sparkles, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from './StarRating';

interface Activity {
    id: string;
    user_id: string;
    type: 'started_reading' | 'finished' | 'reviewed' | 'added_to_library' | 'system_event';
    book_id: string;
    book_title: string | null;
    book_cover: string | null;
    metadata: {
        rating?: number;
        review_snippet?: string;
        status?: string;
        description?: string;
    } | null;
    created_at: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

interface ActivityFeedProps {
    userId?: string; // If provided, shows only that user's activities
    followingIds?: string[]; // If provided, shows activities from these users
    limit?: number;
    showHeader?: boolean;
}

const SYSTEM_EVENTS: Activity[] = [
    {
        id: 'sys_1',
        user_id: 'system',
        type: 'system_event',
        book_id: 'trending_1',
        book_title: 'Project Hail Mary',
        book_cover: 'http://books.google.com/books/content?id=WuRQzwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        metadata: {
            description: 'is trending in the Science Fiction community this week!'
        },
        created_at: new Date().toISOString(),
        profiles: {
            full_name: 'ApicBooks Trends',
            avatar_url: null
        }
    },
    {
        id: 'sys_2',
        user_id: 'system',
        type: 'system_event',
        book_id: 'trending_2',
        book_title: 'Atomic Habits',
        book_cover: 'http://books.google.com/books/content?id=fFCjDQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        metadata: {
            description: 'has been added to 150+ libraries this month.'
        },
        created_at: new Date(Date.now() - 86400000).toISOString(),
        profiles: {
            full_name: 'Community Pulse',
            avatar_url: null
        }
    }
];

export default function ActivityFeed({ userId, followingIds, limit = 20, showHeader = true }: ActivityFeedProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);

            // If filtering by following but following list is empty, return early (empty state)
            if (followingIds !== undefined && followingIds.length === 0 && !userId) {
                setActivities([]);
                setLoading(false);
                return;
            }

            let query = supabase
                .from('activities')
                .select(`
                    id,
                    user_id,
                    type,
                    book_id,
                    book_title,
                    book_cover,
                    metadata,
                    created_at,
                    profiles:user_id (
                        full_name,
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (userId) {
                query = query.eq('user_id', userId);
            } else if (followingIds && followingIds.length > 0) {
                query = query.in('user_id', followingIds);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching activities:', error);
            } else {
                let fetchedActivities = (data || []) as unknown as Activity[];

                // If global feed is empty (and we're not strictly filtering by following/user), show system events
                if (!userId && !followingIds && fetchedActivities.length === 0) {
                    fetchedActivities = SYSTEM_EVENTS;
                }

                setActivities(fetchedActivities);
            }

            setLoading(false);
        };

        fetchActivities();
    }, [userId, followingIds, limit]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'started_reading':
                return <BookOpen className="w-4 h-4 text-blue-400" />;
            case 'finished':
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'reviewed':
                return <Star className="w-4 h-4 text-amber-400" />;
            case 'added_to_library':
                return <Heart className="w-4 h-4 text-rose-400" />;
            case 'system_event':
                return <TrendingUp className="w-4 h-4 text-accent-400" />;
            default:
                return <BookOpen className="w-4 h-4 text-slate-400" />;
        }
    };

    const getActivityText = (activity: Activity) => {
        if (activity.type === 'system_event') {
            return (
                <>
                    <span className="font-bold text-accent-400">{activity.profiles?.full_name}</span>
                    <span className="text-slate-300"> says: </span>
                </>
            );
        }

        const userName = activity.profiles?.full_name || 'Someone';
        switch (activity.type) {
            case 'started_reading':
                return <><span className="font-medium text-foreground dark:text-white">{userName}</span> started reading</>;
            case 'finished':
                return <><span className="font-medium text-foreground dark:text-white">{userName}</span> finished</>;
            case 'reviewed':
                return <><span className="font-medium text-foreground dark:text-white">{userName}</span> reviewed</>;
            case 'added_to_library':
                return <><span className="font-medium text-foreground dark:text-white">{userName}</span> added to library</>;
            default:
                return <><span className="font-medium text-foreground dark:text-white">{userName}</span> updated</>;
        }
    };

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return then.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-3 p-4 bg-[#141b3d]/60 rounded-xl">
                        <div className="w-10 h-10 bg-slate-700 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-3/4" />
                            <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 dark:bg-[#141b3d]/60 border border-slate-200 dark:border-card-border rounded-2xl">
                <Clock className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">No Activity Yet</h3>
                <p className="text-slate-500 text-sm">
                    {userId ? "This user hasn't posted any activity yet." : "Start reading or follow friends to see activity here!"}
                </p>
            </div>
        );
    }

    return (
        <div>
            {showHeader && (
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 border border-primary-500/20 dark:border-primary-500/30">
                        <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground dark:text-white">Recent Activity</h3>
                </div>
            )}

            <div className="space-y-3">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className={`flex gap-3 p-4 border rounded-xl transition-colors ${activity.type === 'system_event'
                            ? 'bg-accent-500/5 border-accent-500/20 hover:border-accent-500/40'
                            : 'bg-white dark:bg-[#141b3d]/60 border-slate-200 dark:border-card-border hover:border-primary-200 dark:hover:border-[#2a3459]'
                            }`}
                    >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {activity.type === 'system_event' ? (
                                <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center border border-accent-500/30">
                                    <Sparkles className="w-5 h-5 text-accent-400" />
                                </div>
                            ) : activity.profiles?.avatar_url ? (
                                <Image
                                    src={activity.profiles.avatar_url}
                                    alt={activity.profiles.full_name || 'User'}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                {getActivityIcon(activity.type)}
                                <span>{getActivityText(activity)}</span>
                            </div>

                            {/* System Event Text */}
                            {activity.type === 'system_event' ? (
                                <div className="mt-1 mb-2 text-foreground dark:text-white">
                                    <span className="font-bold italic">"{activity.book_title}"</span> {activity.metadata?.description}
                                </div>
                            ) : null}

                            {/* Book Info */}
                            {activity.book_id && (activity.type !== 'system_event' || activity.book_cover) && (
                                <Link
                                    href={`/book/${activity.book_id}`}
                                    className="flex items-center gap-3 mt-2 group"
                                >
                                    {activity.book_cover && (
                                        <Image
                                            src={activity.book_cover}
                                            alt={activity.book_title || 'Book'}
                                            width={32}
                                            height={48}
                                            className="rounded shadow-lg group-hover:scale-105 transition-transform"
                                        />
                                    )}
                                    <span className={`font-medium group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors line-clamp-1 ${activity.type === 'system_event' ? 'text-accent-600 dark:text-accent-300' : 'text-foreground dark:text-white'
                                        }`}>
                                        {activity.book_title || 'Unknown Book'}
                                    </span>
                                </Link>
                            )}

                            {/* Rating if reviewed */}
                            {activity.type === 'reviewed' && activity.metadata?.rating && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-1 mb-1">
                                        <StarRating rating={activity.metadata.rating} readonly size="sm" />
                                    </div>
                                    {activity.metadata.review_snippet && (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{activity.metadata.review_snippet}"</p>
                                    )}
                                    {/* Fallback if snippet is missing but full review is in metadata desc or elsewhere, though usually we put it in snippet */}
                                    {!activity.metadata.review_snippet && activity.metadata.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{activity.metadata.description}"</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Timestamp */}
                        <span className="text-xs text-slate-500 flex-shrink-0">
                            {formatTimeAgo(activity.created_at)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
export async function logActivity(
    userId: string,
    type: Activity['type'],
    bookId: string,
    bookTitle?: string,
    bookCover?: string,
    metadata?: Activity['metadata']
) {
    const supabase = createClient();

    const { error } = await supabase.from('activities').insert({
        user_id: userId,
        type,
        book_id: bookId,
        book_title: bookTitle,
        book_cover: bookCover,
        metadata: metadata || {}
    });

    if (error) {
        console.error('Error logging activity:', error);
    }
}
