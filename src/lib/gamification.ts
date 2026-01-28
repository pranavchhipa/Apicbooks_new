export type Level = 'Beginner' | 'Reader' | 'Bookworm' | 'Scholar';

export const LEVELS: Record<Level, { minXP: number; label: string; color: string }> = {
    Beginner: { minXP: 0, label: 'Beginner', color: 'text-slate-400' },
    Reader: { minXP: 500, label: 'Reader', color: 'text-emerald-400' },
    Bookworm: { minXP: 1500, label: 'Bookworm', color: 'text-blue-400' },
    Scholar: { minXP: 3000, label: 'Scholar', color: 'text-amber-400' }
};

export const XP_RATES = {
    PROFILE_SETUP: 200,
    BOOK_READ: 100,
    BOOK_WISHLIST: 20,
    REVIEW: 50
};

export interface Achievement {
    id: string;
    title: string;
    description: string;
    xp: number;
    icon: string;
    isUnlocked: boolean;
}

export function calculateLevel(xp: number): Level {
    if (xp >= LEVELS.Scholar.minXP) return 'Scholar';
    if (xp >= LEVELS.Bookworm.minXP) return 'Bookworm';
    if (xp >= LEVELS.Reader.minXP) return 'Reader';
    return 'Beginner';
}

export function calculateUsageXP(stats: {
    readCount: number;
    wishlistCount: number;
    reviewCount: number;
    hasAvatar: boolean;
    hasBio: boolean;
}) {
    let xp = 0;

    // Activity XP
    xp += stats.readCount * XP_RATES.BOOK_READ;
    xp += stats.wishlistCount * XP_RATES.BOOK_WISHLIST;
    xp += stats.reviewCount * XP_RATES.REVIEW;

    // Profile XP
    if (stats.hasAvatar) xp += 100;
    if (stats.hasBio) xp += 100;

    return xp;
}

export function getAchievements(stats: {
    readCount: number;
    hasAvatar: boolean;
    hasBio: boolean;
    wishlistCount: number;
    readThisMonth: number;
}): Achievement[] {
    return [
        {
            id: 'identity',
            title: 'Identity',
            description: 'Set up your profile picture',
            xp: 100,
            icon: 'User',
            isUnlocked: stats.hasAvatar
        },
        {
            id: 'biographer',
            title: 'Biographer',
            description: 'Tell us about yourself (Bio)',
            xp: 100,
            icon: 'FileText',
            isUnlocked: stats.hasBio
        },
        {
            id: 'curator',
            title: 'Curator',
            description: 'Add a book to your wishlist',
            xp: 20,
            icon: 'Heart',
            isUnlocked: stats.wishlistCount >= 1
        },
        {
            id: 'first_read',
            title: 'First Step',
            description: 'Read your first book',
            xp: 100,
            icon: 'BookOpen',
            isUnlocked: stats.readCount >= 1
        },
        {
            id: 'bookworm',
            title: 'Bookworm',
            description: 'Read 10 books',
            xp: 500,
            icon: 'Library',
            isUnlocked: stats.readCount >= 10
        },
        {
            id: 'monthly_active',
            title: 'Active Reader',
            description: 'Read a book this month',
            xp: 50,
            icon: 'Calendar',
            isUnlocked: stats.readThisMonth >= 1
        }
    ];
}
