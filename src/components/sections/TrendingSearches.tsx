'use client';

import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

const trendingSearches = [
    'Atomic Habits',
    'The Midnight Library',
    'Project Hail Mary',
    'Dune',
    'The Psychology of Money',
    'Sapiens',
    'Fourth Wing',
    'Lessons in Chemistry',
    'Tomorrow and Tomorrow',
    'The Housemaid',
];

export default function TrendingSearches() {
    return (
        <section className="py-12 border-y border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-primary-400" />
                        <span className="font-medium">Trending:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((search) => (
                            <Link
                                key={search}
                                href={`/?q=${encodeURIComponent(search)}`}
                                className="px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-white hover:border-primary-500/30 transition-all duration-300"
                            >
                                {search}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
