'use client';

import { useState, useEffect } from 'react';
import { User, ExternalLink, Loader2 } from 'lucide-react';

interface AuthorBio {
    name: string;
    extract: string;
    thumbnail?: string;
    pageUrl: string;
}

async function fetchAuthorBio(authorName: string): Promise<AuthorBio | null> {
    try {
        // Use Wikipedia REST API to get a short extract
        const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(authorName)}`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
            // Try search endpoint as fallback
            const searchResponse = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(authorName + ' author')}&format=json&origin=*&srlimit=1`
            );
            const searchData = await searchResponse.json();

            if (searchData.query?.search?.[0]) {
                const pageTitle = searchData.query.search[0].title;
                const summaryResponse = await fetch(
                    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
                );
                if (!summaryResponse.ok) return null;

                const data = await summaryResponse.json();
                return {
                    name: data.title,
                    extract: data.extract || '',
                    thumbnail: data.thumbnail?.source,
                    pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
                };
            }
            return null;
        }

        const data = await response.json();

        // Skip disambiguation pages
        if (data.type === 'disambiguation') return null;

        return {
            name: data.title,
            extract: data.extract || '',
            thumbnail: data.thumbnail?.source,
            pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(authorName)}`,
        };
    } catch {
        return null;
    }
}

export default function AuthorBioCard({ authorName }: { authorName: string }) {
    const [bio, setBio] = useState<AuthorBio | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!authorName || authorName === 'Unknown Author') {
            setLoading(false);
            return;
        }

        fetchAuthorBio(authorName).then((result) => {
            setBio(result);
            setLoading(false);
        });
    }, [authorName]);

    if (loading) {
        return (
            <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                    <span className="text-sm text-slate-400">Loading author info...</span>
                </div>
            </div>
        );
    }

    if (!bio) return null;

    const shortExtract = bio.extract.length > 200 ? bio.extract.slice(0, 200) + '...' : bio.extract;
    const displayExtract = expanded ? bio.extract : shortExtract;

    return (
        <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-400" />
                About the Author
            </h2>

            <div className="flex gap-4">
                {bio.thumbnail && (
                    <img
                        src={bio.thumbnail}
                        alt={bio.name}
                        className="w-20 h-24 rounded-xl object-cover flex-shrink-0 border border-[#1e2749]"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base mb-1">{bio.name}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {displayExtract}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                        {bio.extract.length > 200 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                {expanded ? 'Show less' : 'Read more'}
                            </button>
                        )}
                        <a
                            href={bio.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors ml-auto"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Wikipedia
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
