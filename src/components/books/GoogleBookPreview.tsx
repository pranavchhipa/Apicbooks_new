'use client';

import { useState } from 'react';
import { BookOpen, Maximize2, X } from 'lucide-react';

interface GooglePreviewProps {
    googleBookId: string; // Google Books volume ID (not UUID)
    bookTitle: string;
}

export default function GoogleBookPreview({ googleBookId, bookTitle }: GooglePreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasError, setHasError] = useState(false);

    if (hasError || !googleBookId) return null;

    const previewUrl = `https://books.google.com/books?id=${googleBookId}&lpg=PP1&pg=PP1&output=embed`;

    return (
        <>
            <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                        Preview
                    </h2>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        title="Expand preview"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-[#1e2749]" style={{ height: '350px' }}>
                    <iframe
                        src={previewUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title={`Preview of ${bookTitle}`}
                        onError={() => setHasError(true)}
                        allow="encrypted-media"
                    />
                </div>

                <p className="text-xs text-slate-500 mt-2 text-center">
                    Preview provided by Google Books. Availability varies by publisher.
                </p>
            </div>

            {/* Expanded Modal */}
            {isExpanded && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="relative w-full max-w-4xl h-[80vh] bg-[#0a0e27] rounded-2xl border border-[#1e2749] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-[#1e2749]">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-emerald-400" />
                                {bookTitle} — Preview
                            </h3>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <iframe
                            src={previewUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            title={`Full preview of ${bookTitle}`}
                            allow="encrypted-media"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
