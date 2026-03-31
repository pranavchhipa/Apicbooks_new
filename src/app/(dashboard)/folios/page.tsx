'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, BookOpen, Heart, Globe, Lock, X, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Folio {
    id: string;
    title: string;
    description: string;
    cover_url: string;
    is_public: boolean;
    like_count: number;
    book_count: number;
    created_at: string;
    user_id: string;
    user?: { full_name: string; avatar_url: string };
}

interface FolioBook {
    id: string;
    book_id: string;
    title: string;
    author: string;
    cover_url: string;
    note: string;
}

export default function FoliosPage() {
    const [folios, setFolios] = useState<Folio[]>([]);
    const [myFolios, setMyFolios] = useState<Folio[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newFolio, setNewFolio] = useState({ title: '', description: '', is_public: true });
    const [activeTab, setActiveTab] = useState<'discover' | 'mine'>('discover');
    const supabase = createClient();

    useEffect(() => {
        fetchFolios();
    }, []);

    async function fetchFolios() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch public folios
        const { data: publicFolios } = await supabase
            .from('folios')
            .select('*, user:profiles!folios_user_id_fkey(full_name, avatar_url)')
            .eq('is_public', true)
            .order('like_count', { ascending: false })
            .limit(20);

        setFolios(publicFolios || []);

        // Fetch user's folios
        if (user) {
            const { data: userFolios } = await supabase
                .from('folios')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setMyFolios(userFolios || []);
        }
        setLoading(false);
    }

    async function createFolio() {
        if (!newFolio.title.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('folios').insert({
            user_id: user.id,
            title: newFolio.title,
            description: newFolio.description,
            is_public: newFolio.is_public,
        });

        if (!error) {
            setShowCreate(false);
            setNewFolio({ title: '', description: '', is_public: true });
            fetchFolios();
        }
    }

    const displayFolios = activeTab === 'mine' ? myFolios : folios;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Folios</h1>
                    <p className="text-white/40 mt-1">Curated book lists from the community</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 w-fit">
                    <Plus className="w-4 h-4" />
                    Create Folio
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-full w-fit mb-8">
                {(['discover', 'mine'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                            activeTab === tab
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'text-white/40 hover:text-white border border-transparent'
                        }`}
                    >
                        {tab === 'discover' ? 'Discover' : 'My Folios'}
                    </button>
                ))}
            </div>

            {/* Folios Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] animate-pulse">
                            <div className="h-6 bg-white/[0.06] rounded w-3/4 mb-3" />
                            <div className="h-4 bg-white/[0.03] rounded w-full mb-2" />
                            <div className="h-4 bg-white/[0.03] rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : displayFolios.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06]">
                    <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-display font-semibold text-white mb-2">
                        {activeTab === 'mine' ? 'No folios yet' : 'No folios found'}
                    </h3>
                    <p className="text-white/40 mb-6">
                        {activeTab === 'mine'
                            ? 'Create your first curated book list'
                            : 'Be the first to create a folio'}
                    </p>
                    <button onClick={() => setShowCreate(true)} className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors">
                        Create Your First Folio
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayFolios.map(folio => (
                        <div key={folio.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all cursor-pointer group">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-serif font-semibold text-white group-hover:text-amber-400 transition-colors">
                                    {folio.title}
                                </h3>
                                {folio.is_public ? (
                                    <Globe className="w-4 h-4 text-white/30 flex-shrink-0" />
                                ) : (
                                    <Lock className="w-4 h-4 text-white/30 flex-shrink-0" />
                                )}
                            </div>
                            {folio.description && (
                                <p className="text-white/40 text-sm mb-4 line-clamp-2">{folio.description}</p>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/30">
                                    {folio.book_count} {folio.book_count === 1 ? 'book' : 'books'}
                                </span>
                                <div className="flex items-center gap-1 text-white/30">
                                    <Heart className="w-3.5 h-3.5" />
                                    {folio.like_count}
                                </div>
                            </div>
                            {folio.user && (
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                                    <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center">
                                        {folio.user.avatar_url ? (
                                            <Image src={folio.user.avatar_url} alt="" width={24} height={24} className="rounded-full" />
                                        ) : (
                                            <span className="text-xs font-medium text-amber-400">
                                                {folio.user.full_name?.[0] || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-white/40">{folio.user.full_name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Folio Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
                    <div className="bg-surface border border-white/[0.06] rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display font-bold text-white">Create a Folio</h2>
                            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-white/[0.03] rounded-full">
                                <X className="w-5 h-5 text-white/30" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-1.5">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Best Sci-Fi of 2024"
                                    value={newFolio.title}
                                    onChange={e => setNewFolio(p => ({ ...p, title: e.target.value }))}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1.5">Description</label>
                                <textarea
                                    placeholder="What's this folio about?"
                                    value={newFolio.description}
                                    onChange={e => setNewFolio(p => ({ ...p, description: e.target.value }))}
                                    rows={3}
                                    className="input-field resize-none"
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newFolio.is_public}
                                    onChange={e => setNewFolio(p => ({ ...p, is_public: e.target.checked }))}
                                    className="w-4 h-4 rounded border-white/[0.06] bg-white/[0.03] text-amber-500 focus:ring-amber-500"
                                />
                                <span className="text-sm text-white/60">Make this folio public</span>
                            </label>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/60 hover:text-white hover:border-white/[0.12] transition-all font-medium text-sm">Cancel</button>
                            <button onClick={createFolio} className="flex-1 px-4 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors text-sm">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
