'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    Users, BookOpen, MessageCircle, Plus, ArrowLeft,
    Send, AlertTriangle, Clock, Heart, MoreHorizontal
} from 'lucide-react';

interface Club {
    id: string;
    name: string;
    description: string;
    cover_url: string;
    genre: string;
    member_count: number;
    current_book_title: string;
    current_book_cover: string;
    current_book_author: string;
    current_book_id: string;
    creator_id: string;
    created_at: string;
    creator?: { full_name: string; avatar_url: string };
}

interface Discussion {
    id: string;
    title: string;
    content: string;
    chapter: string;
    is_spoiler: boolean;
    reply_count: number;
    like_count: number;
    created_at: string;
    author?: { full_name: string; avatar_url: string };
}

interface Member {
    id: string;
    role: string;
    joined_at: string;
    profile?: { full_name: string; avatar_url: string };
}

export default function ClubDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clubId = params.id as string;
    const supabase = createClient();

    const [club, setClub] = useState<Club | null>(null);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [showNewDiscussion, setShowNewDiscussion] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', chapter: '', is_spoiler: false });
    const [activeTab, setActiveTab] = useState<'discussions' | 'members' | 'about'>('discussions');

    useEffect(() => {
        fetchClubData();
    }, [clubId]);

    async function fetchClubData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);

        // Fetch club
        const { data: clubData } = await supabase
            .from('book_clubs')
            .select('*, creator:profiles!book_clubs_creator_id_fkey(full_name, avatar_url)')
            .eq('id', clubId)
            .single();

        if (clubData) setClub(clubData);

        // Fetch members
        const { data: membersData } = await supabase
            .from('club_members')
            .select('*, profile:profiles!club_members_user_id_fkey(full_name, avatar_url)')
            .eq('club_id', clubId)
            .limit(50);

        setMembers(membersData || []);

        if (user && membersData) {
            setIsMember(membersData.some(m => m.user_id === user.id));
        }

        // Fetch discussions
        const { data: discussionsData } = await supabase
            .from('club_discussions')
            .select('*, author:profiles!club_discussions_user_id_fkey(full_name, avatar_url)')
            .eq('club_id', clubId)
            .order('created_at', { ascending: false });

        setDiscussions(discussionsData || []);
        setLoading(false);
    }

    async function joinClub() {
        const res = await fetch(`/api/clubs/${clubId}/join`, { method: 'POST' });
        if (res.ok) {
            toast.success('Joined the club!');
            setIsMember(true);
            fetchClubData();
        } else {
            const data = await res.json();
            toast.error(data.error || 'Failed to join');
        }
    }

    async function leaveClub() {
        const res = await fetch(`/api/clubs/${clubId}/join`, { method: 'DELETE' });
        if (res.ok) {
            toast.success('Left the club');
            setIsMember(false);
            fetchClubData();
        }
    }

    async function postDiscussion() {
        if (!newPost.title.trim() || !newPost.content.trim()) return;
        const res = await fetch(`/api/clubs/${clubId}/discussions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost),
        });
        if (res.ok) {
            toast.success('Discussion posted!');
            setShowNewDiscussion(false);
            setNewPost({ title: '', content: '', chapter: '', is_spoiler: false });
            fetchClubData();
        }
    }

    function timeAgo(date: string) {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto animate-pulse">
                <div className="h-8 bg-white/[0.04] rounded w-1/3 mb-4" />
                <div className="h-4 bg-white/[0.03] rounded w-2/3 mb-8" />
                <div className="h-48 bg-white/[0.03] rounded-2xl" />
            </div>
        );
    }

    if (!club) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-display text-white mb-2">Club not found</h2>
                <Link href="/clubs" className="text-amber-400 hover:underline">Browse clubs</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to clubs
            </button>

            {/* Club Header */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 md:p-8 text-white mb-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-white/[0.08] rounded-full text-sm mb-3 text-white/60">
                            {club.genre || 'General'}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 text-white">{club.name}</h1>
                        <p className="text-white/60 mb-4">{club.description}</p>
                        <div className="flex items-center gap-4 text-sm text-white/40">
                            <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                {club.member_count} members
                            </span>
                            <span>Created by {club.creator?.full_name || 'Unknown'}</span>
                        </div>
                        <div className="mt-6">
                            {isMember ? (
                                <div className="flex gap-3">
                                    <button onClick={() => setShowNewDiscussion(true)} className="px-5 py-2.5 bg-amber-500/20 text-amber-400 rounded-full font-medium hover:bg-amber-500/30 transition-colors flex items-center gap-2 border border-amber-500/30">
                                        <Plus className="w-4 h-4" />
                                        New Discussion
                                    </button>
                                    <button onClick={leaveClub} className="px-5 py-2.5 bg-white/[0.05] rounded-full font-medium hover:bg-white/[0.08] transition-colors text-white/60 border border-white/[0.06]">
                                        Leave Club
                                    </button>
                                </div>
                            ) : (
                                <button onClick={joinClub} className="px-6 py-3 bg-amber-500/20 text-amber-400 rounded-full font-semibold hover:bg-amber-500/30 transition-colors border border-amber-500/30">
                                    Join This Club
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Current Book */}
                    {club.current_book_title && (
                        <div className="bg-white/[0.05] border border-white/[0.06] rounded-2xl p-4 flex-shrink-0">
                            <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Currently Reading</p>
                            <div className="flex gap-3">
                                {club.current_book_cover && (
                                    <Image
                                        src={club.current_book_cover}
                                        alt={club.current_book_title}
                                        width={80}
                                        height={120}
                                        className="rounded-lg book-shadow"
                                    />
                                )}
                                <div>
                                    <h3 className="font-serif font-semibold text-white">{club.current_book_title}</h3>
                                    <p className="text-sm text-white/40">{club.current_book_author}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-full w-fit mb-8">
                {(['discussions', 'members', 'about'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                            activeTab === tab
                                ? 'bg-white/[0.08] text-white shadow-sm'
                                : 'text-white/40 hover:text-white/80'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Discussions Tab */}
            {activeTab === 'discussions' && (
                <div className="space-y-4">
                    {discussions.length === 0 ? (
                        <div className="text-center py-12 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06]">
                            <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                            <h3 className="font-display text-lg text-white mb-1">No discussions yet</h3>
                            <p className="text-white/40 text-sm">Start the conversation!</p>
                        </div>
                    ) : (
                        discussions.map(d => (
                            <div key={d.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                                        {d.author?.avatar_url ? (
                                            <Image src={d.author.avatar_url} alt="" width={36} height={36} className="rounded-full" />
                                        ) : (
                                            <span className="text-sm font-medium text-violet-400">{d.author?.full_name?.[0] || '?'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm text-white">{d.author?.full_name}</span>
                                            <span className="text-xs text-white/30">{timeAgo(d.created_at)}</span>
                                            {d.is_spoiler && (
                                                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full flex items-center gap-1 border border-red-500/20">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Spoiler
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-serif font-semibold text-white mb-1">{d.title}</h3>
                                        {d.chapter && <p className="text-xs text-white/30 mb-2">Chapter: {d.chapter}</p>}
                                        <p className="text-white/50 text-sm line-clamp-3">{d.content}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
                                            <button className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                                                <Heart className="w-3.5 h-3.5" />
                                                {d.like_count}
                                            </button>
                                            <button className="flex items-center gap-1 hover:text-violet-400 transition-colors">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                {d.reply_count} replies
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {members.map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-4 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all">
                            <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                                {m.profile?.avatar_url ? (
                                    <Image src={m.profile.avatar_url} alt="" width={40} height={40} className="rounded-full" />
                                ) : (
                                    <span className="text-sm font-medium text-violet-400">{m.profile?.full_name?.[0] || '?'}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{m.profile?.full_name || 'Reader'}</p>
                                <p className="text-xs text-white/30 capitalize">{m.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="font-display text-xl font-bold text-white mb-3">About this club</h3>
                    <p className="text-white/50 mb-4">{club.description || 'No description provided.'}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-white/30">Genre</p>
                            <p className="font-medium text-white">{club.genre || 'General'}</p>
                        </div>
                        <div>
                            <p className="text-white/30">Members</p>
                            <p className="font-medium text-white">{club.member_count}</p>
                        </div>
                        <div>
                            <p className="text-white/30">Created</p>
                            <p className="font-medium text-white">{new Date(club.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-white/30">Created by</p>
                            <p className="font-medium text-white">{club.creator?.full_name || 'Unknown'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* New Discussion Modal */}
            {showNewDiscussion && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewDiscussion(false)}>
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-display font-bold text-white mb-6">Start a Discussion</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Discussion title"
                                value={newPost.title}
                                onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                                className="input-field"
                            />
                            <textarea
                                placeholder="What would you like to discuss?"
                                value={newPost.content}
                                onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                                rows={4}
                                className="input-field resize-none"
                            />
                            <input
                                type="text"
                                placeholder="Chapter (optional)"
                                value={newPost.chapter}
                                onChange={e => setNewPost(p => ({ ...p, chapter: e.target.value }))}
                                className="input-field"
                            />
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newPost.is_spoiler}
                                    onChange={e => setNewPost(p => ({ ...p, is_spoiler: e.target.checked }))}
                                    className="w-4 h-4 rounded border-white/[0.1] text-amber-500"
                                />
                                <span className="text-sm text-white/80">Contains spoilers</span>
                            </label>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowNewDiscussion(false)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={postDiscussion} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" />
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
