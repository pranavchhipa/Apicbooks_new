'use client';

import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, Book, Search } from 'lucide-react';
import { GoogleBook } from '@/lib/api/google-books';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface MoodSearchProps {
    onSearch?: (mood: string) => void;
    isLoading?: boolean;
}

const MOOD_TAGS = [
    { label: 'Mysterious', emoji: '🕵️‍♀️', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { label: 'Uplifting', emoji: '✨', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { label: 'Adventurous', emoji: '🗺️', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { label: 'Romantic', emoji: '💝', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
    { label: 'Intellectual', emoji: '🧠', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { label: 'Dark', emoji: '🌑', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export default function MoodSearch({ onSearch, isLoading = false }: MoodSearchProps) {
    const [query, setQuery] = useState('');
    const [localThinking, setLocalThinking] = useState(false);
    const router = useRouter();

    const isBusy = isLoading || localThinking;

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLocalThinking(true);
        // Navigate to discover page with query
        router.push(`/discover?mood=${encodeURIComponent(query)}`);

        // Reset local thinking after a short delay if navigation is instant 
        // or let it persist until parent isLoading takes over (if managed by parent)
        // With router.push, if it's a soft nav, we might need to reset it or rely on parent.
        // For simplicity, we keep it true until the component potentially remounts or we explicitly reset.
        // But since we are likely staying on the page in Discover, we should rely on the parent's isLoading.
        // We'll set a timeout to reset local thinking just in case.
        setTimeout(() => setLocalThinking(false), 2000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-display font-bold text-white mb-3">
                    Ask <span className="gradient-text">Anika</span>
                </h2>
                <p className="text-slate-400">
                    Your Personal AI Librarian. Tell me how you're feeling or what you're looking for.
                </p>
            </div>

            <div className="relative group z-20">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 rounded-2xl opacity-50 group-hover:opacity-75 blur transition duration-500" />

                <form onSubmit={handleSearch} className="relative flex items-center bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-2 transition-transform duration-300 group-hover:scale-[1.01]">
                    <div className="pl-4 pr-3 text-primary-500">
                        <Sparkles className="w-6 h-6 animate-pulse-slow" />
                    </div>

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="I want a sci-fi mystery with a female protagonist set on Mars..."
                        className="flex-1 bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 text-lg py-3 px-2 outline-none"
                    />

                    <button
                        type="submit"
                        disabled={!query.trim() || isBusy}
                        className="p-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium shadow-lg hover:shadow-primary-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        {isBusy ? (
                            <span className="animate-pulse">Thinking...</span>
                        ) : (
                            <>
                                <span>Find Books</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Quick Mood Tags */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                {MOOD_TAGS.map((tag) => (
                    <button
                        key={tag.label}
                        onClick={() => {
                            setQuery(tag.label);
                            // Optional: auto-search or just fill
                        }}
                        className={`
                            px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300
                            ${tag.color}
                            hover:scale-105 hover:bg-opacity-20 flex items-center gap-2
                        `}
                    >
                        <span>{tag.emoji}</span>
                        <span className="font-medium">{tag.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
