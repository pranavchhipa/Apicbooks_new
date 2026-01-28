'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onChange?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
    showValue?: boolean;
}

/**
 * Half-star rating component
 * Supports ratings from 0 to 5 in 0.5 increments
 */
export default function StarRating({
    rating = 0,
    onChange,
    size = 'md',
    readonly = false,
    showValue = false
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const displayRating = hoverRating !== null ? hoverRating : rating;

    const handleClick = (starIndex: number, isLeftHalf: boolean) => {
        if (readonly || !onChange) return;
        const newRating = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
        onChange(newRating);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
        if (readonly) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isLeftHalf = x < rect.width / 2;
        setHoverRating(isLeftHalf ? starIndex + 0.5 : starIndex + 1);
    };

    const handleMouseLeave = () => {
        if (readonly) return;
        setHoverRating(null);
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((starIndex) => {
                    const fillPercentage = Math.min(
                        Math.max((displayRating - starIndex) * 100, 0),
                        100
                    );

                    return (
                        <button
                            key={starIndex}
                            type="button"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const isLeftHalf = x < rect.width / 2;
                                handleClick(starIndex, isLeftHalf);
                            }}
                            onMouseMove={(e) => handleMouseMove(e, starIndex)}
                            onMouseLeave={handleMouseLeave}
                            disabled={readonly}
                            className={`
                                relative transition-transform
                                ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                            `}
                            aria-label={`Rate ${starIndex + 1} stars`}
                        >
                            {/* Background star (empty) */}
                            <Star
                                className={`${sizeClasses[size]} text-slate-600`}
                            />

                            {/* Foreground star (filled) with clip */}
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star
                                    className={`${sizeClasses[size]} text-amber-400 fill-amber-400`}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>

            {showValue && (
                <span className="text-sm font-medium text-slate-400 ml-2">
                    {displayRating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

// Display-only version for showing ratings (no interaction)
export function StarRatingDisplay({
    rating,
    size = 'sm',
    showCount
}: {
    rating: number;
    size?: 'sm' | 'md' | 'lg';
    showCount?: number;
}) {
    return (
        <div className="flex items-center gap-2">
            <StarRating rating={rating} readonly size={size} />
            <span className="text-xs text-slate-400">
                {rating.toFixed(1)}
                {showCount !== undefined && (
                    <span className="text-slate-500"> ({showCount})</span>
                )}
            </span>
        </div>
    );
}
