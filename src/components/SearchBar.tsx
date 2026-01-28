'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
    onMoodSearch?: (mood: string) => void;
    onSearch?: (query: string) => void;
    className?: string;
    placeholder?: string;
    showMoodToggle?: boolean;
}

export default function SearchBar({
    onMoodSearch,
    onSearch,
    className = '',
    placeholder = 'Search by title, author, or ISBN...',
    showMoodToggle = true
}: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isMoodMode, setIsMoodMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Detect if query looks like a mood/recommendation request
    const isMoodQuery = useCallback((text: string) => {
        const moodKeywords = [
            'recommend', 'suggest', 'feeling', 'mood', 'want something',
            'looking for', 'in the mood', 'like', 'similar to', 'vibe',
            'cozy', 'exciting', 'romantic', 'thriller', 'adventure',
            'feel good', 'sad', 'happy', 'inspiring', 'funny'
        ];
        const lowerText = text.toLowerCase();
        return moodKeywords.some(keyword => lowerText.includes(keyword));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) return;

        setIsLoading(true);

        try {
            // Auto-detect mood queries and use AI search
            const shouldUseMoodSearch = isMoodMode || isMoodQuery(query);

            if (shouldUseMoodSearch && onMoodSearch) {
                onMoodSearch(query);
            } else if (onSearch) {
                onSearch(query);
            } else {
                // Navigate to search results
                router.push(`/discover?q=${encodeURIComponent(query)}`);
            }
        } finally {
            setIsLoading(false);
        }
    }, [query, isMoodMode, isMoodQuery, onMoodSearch, router]);

    const clearQuery = useCallback(() => {
        setQuery('');
        inputRef.current?.focus();
    }, []);

    const toggleMoodMode = useCallback(() => {
        setIsMoodMode(prev => !prev);
        inputRef.current?.focus();
    }, []);

    // Keyboard shortcut: Cmd/Ctrl + K to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <form onSubmit={handleSubmit} className={`w-full max-w-3xl mx-auto ${className}`}>
            <div
                className={`
          relative flex items-center gap-3 px-5 py-4 rounded-2xl
          transition-all duration-300
          ${isMoodMode
                        ? 'bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50'
                        : 'bg-slate-800/60 border border-slate-600/50'
                    }
          ${isFocused ? 'ring-2 ring-primary-500/50 border-primary-500/50' : ''}
        `}
            >
                {/* Search/Mood Icon */}
                <div className={`
          flex-shrink-0 transition-transform duration-300
          ${isFocused ? 'scale-110' : ''}
        `}>
                    {isMoodMode ? (
                        <Sparkles className="w-6 h-6 text-purple-400" />
                    ) : (
                        <Search className="w-6 h-6 text-slate-400" />
                    )}
                </div>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={isMoodMode
                        ? 'Describe your mood... "a cozy mystery set in Paris"'
                        : placeholder
                    }
                    className={`
            flex-1 bg-transparent text-white text-lg outline-none
            placeholder:text-slate-400 placeholder:text-base
          `}
                />

                {/* Clear Button */}
                {query && (
                    <button
                        type="button"
                        onClick={clearQuery}
                        className="flex-shrink-0 p-1 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Mood Toggle */}
                {showMoodToggle && (
                    <button
                        type="button"
                        onClick={toggleMoodMode}
                        className={`
              flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm
              transition-all duration-300
              ${isMoodMode
                                ? 'bg-purple-500 text-white hover:bg-purple-600'
                                : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600/60 hover:text-white'
                            }
            `}
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="hidden sm:inline">Mood</span>
                        </div>
                    </button>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className={`
            flex-shrink-0 px-6 py-2.5 rounded-xl font-semibold text-sm
            transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            ${isMoodMode
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                            : 'bg-primary-500 text-white hover:bg-primary-600'
                        }
          `}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'Search'
                    )}
                </button>
            </div>

            {/* Hint text */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
                <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">⌘K</kbd> to focus</span>
                {isMoodMode && (
                    <span className="text-purple-400">
                        ✨ AI will find books matching your vibe
                    </span>
                )}
            </div>
        </form>
    );
}
