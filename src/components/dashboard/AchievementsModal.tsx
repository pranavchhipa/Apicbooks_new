'use client';

import { X, Trophy, Lock, CheckCircle, Zap, FileText, Heart, User, BookOpen, Library, Calendar } from 'lucide-react';
import { Achievement, Level, LEVELS } from '@/lib/gamification';

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievements: Achievement[];
    xp: number;
    level: Level;
}

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

export default function AchievementsModal({ isOpen, onClose, achievements, xp, level }: AchievementsModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const currentLevel = LEVELS[level];
    const nextLevelKey = (Object.keys(LEVELS) as Level[]).find(k => LEVELS[k].minXP > xp);
    const nextLevel = nextLevelKey ? LEVELS[nextLevelKey] : null;

    const progress = nextLevel
        ? Math.min(100, Math.max(0, ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100))
        : 100;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-secondary dark:bg-[#0c0a14] border border-card-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-card-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg shadow-amber-500/20">
                            <Trophy className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Your Achievements</h2>
                            <p className={`text-sm font-medium ${currentLevel.color}`}>
                                Level: {currentLevel.label} ({xp} XP)
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-elevated">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Level Progress */}
                <div className="px-6 pt-6 pb-2 shrink-0">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2 uppercase font-bold tracking-wider">
                        <span>{currentLevel.label}</span>
                        <span>{nextLevel ? nextLevel.label : 'Max Level'}</span>
                    </div>
                    <div className="h-3 bg-card-border rounded-full overflow-hidden relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-accent-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {nextLevel && (
                        <p className="text-center text-xs text-slate-500 mt-2">
                            {nextLevel.minXP - xp} XP to next level
                        </p>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {achievements.map((item) => (
                        <div
                            key={item.id}
                            className={`
                                relative p-4 rounded-xl border transition-all duration-300
                                ${item.isUnlocked
                                    ? 'bg-[#141b3d]/40 border-primary-500/30 shadow-lg shadow-primary-500/5'
                                    : 'bg-[#0a0e27] border-card-border opacity-70 grayscale'
                                }
                            `}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`
                                    p-3 rounded-xl 
                                    ${item.isUnlocked ? 'bg-primary-500/10 text-primary-400' : 'bg-slate-800 text-muted-foreground/60'}
                                `}>
                                    {/* Dynamic Icon */}
                                    {item.icon === 'User' && <User className="w-6 h-6" />}
                                    {item.icon === 'FileText' && <FileText className="w-6 h-6" />}
                                    {item.icon === 'Heart' && <Heart className="w-6 h-6" />}
                                    {item.icon === 'BookOpen' && <BookOpen className="w-6 h-6" />}
                                    {item.icon === 'Library' && <Library className="w-6 h-6" />}
                                    {item.icon === 'Calendar' && <Calendar className="w-6 h-6" />}

                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-bold ${item.isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {item.title}
                                            {item.isUnlocked && <CheckCircle className="w-4 h-4 inline-block ml-2 text-success-400" />}
                                        </h3>
                                        <span className={`text-xs font-bold px-2 py-1 rounded bg-secondary dark:bg-[#0c0a14] border border-card-border ${item.isUnlocked ? 'text-accent-400' : 'text-muted-foreground/60'}`}>
                                            +{item.xp} XP
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
}
