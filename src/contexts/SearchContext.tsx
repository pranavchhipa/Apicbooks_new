'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { BookWithPrices } from '@/types';

interface SearchContextType {
    searchResults: BookWithPrices[];
    setSearchResults: (results: BookWithPrices[]) => void;
    query: string;
    setQuery: (query: string) => void;
    mood: string;
    setMood: (mood: string) => void;
    aiExplanation: string;
    setAiExplanation: (text: string) => void;
    mode: 'search' | 'mood';
    setMode: (mode: 'search' | 'mood') => void;
    isSearching: boolean;
    setIsSearching: (isSearching: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [searchResults, setSearchResults] = useState<BookWithPrices[]>([]);
    const [query, setQuery] = useState('');
    const [mood, setMood] = useState('');
    const [aiExplanation, setAiExplanation] = useState('');
    const [mode, setMode] = useState<'search' | 'mood'>('search');
    const [isSearching, setIsSearching] = useState(false);

    return (
        <SearchContext.Provider
            value={{
                searchResults,
                setSearchResults,
                query,
                setQuery,
                mood,
                setMood,
                aiExplanation,
                setAiExplanation,
                mode,
                setMode,
                isSearching,
                setIsSearching
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}
