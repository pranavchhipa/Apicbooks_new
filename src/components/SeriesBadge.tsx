import React from 'react';

interface SeriesBadgeProps {
    seriesName?: string | null;
    seriesOrder?: number | null;
    className?: string;
}

const SeriesBadge: React.FC<SeriesBadgeProps> = ({ seriesName, seriesOrder, className = '' }) => {
    // Logic: Display series info if provided. Parent component handles source (Global Metadata or User Override).
    if (!seriesName) return null;

    return (
        <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/20 backdrop-blur-sm shadow-sm ${className}`}>
            <span className="mr-1">📖</span>
            <span className="truncate max-w-[150px]">{seriesName}</span>
            {seriesOrder && (
                <>
                    <span className="mx-1 opacity-50">•</span>
                    <span>Book {seriesOrder}</span>
                </>
            )}
        </div>
    );
};

export default SeriesBadge;
