'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { User, BookOpen, Target, Sparkles, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { updateUserProfile } from '@/lib/api/user';

interface ProfileSetupModalProps {
    isOpen: boolean;
    userId: string;
    onComplete: () => void;
}

const GENRES = [
    "Fiction", "Non-Fiction", "Mystery", "Sci-Fi", "Fantasy",
    "Romance", "Thriller", "Horror", "Biography", "History",
    "Self-Help", "Business", "Psychology", "Philosophy", "Science"
];

export default function ProfileSetupModal({ isOpen, userId, onComplete }: ProfileSetupModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        reading_goal: 12,
        favorite_genres: [] as string[]
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleNext = () => {
        if (step === 1 && !formData.full_name.trim()) {
            toast.error("Please enter your name");
            return;
        }
        setStep(step + 1);
    };

    const toggleGenre = (genre: string) => {
        setFormData(prev => ({
            ...prev,
            favorite_genres: prev.favorite_genres.includes(genre)
                ? prev.favorite_genres.filter(g => g !== genre)
                : [...prev.favorite_genres, genre]
        }));
    };

    const handleSubmit = async () => {
        if (formData.favorite_genres.length < 3) {
            toast.error("Please select at least 3 genres");
            return;
        }

        setLoading(true);
        try {
            await updateUserProfile(userId, {
                full_name: formData.full_name,
                reading_goal: formData.reading_goal,
                favorite_genres: formData.favorite_genres,
                // We can mark onboarding as done by checking these fields existence, 
                // or we could add a specific flag if schema allowed. 
                // For now, presence of these fields implies completion.
            });
            toast.success("Profile setup complete!");
            onComplete();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-fade-in">
            <div className="w-full max-w-lg bg-[#0a0e27]/90 border border-[#1e2749] rounded-2xl shadow-2xl shadow-primary-500/10 overflow-hidden animate-scale-in relative">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />

                {/* Progress Bar */}
                <div className="h-1 bg-[#1e2749] w-full">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="relative z-10 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/30">
                            {step === 1 && <User className="w-8 h-8 text-primary-400" />}
                            {step === 2 && <Target className="w-8 h-8 text-primary-400" />}
                            {step === 3 && <Sparkles className="w-8 h-8 text-primary-400" />}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {step === 1 && "What should we call you?"}
                            {step === 2 && "Set a Reading Goal"}
                            {step === 3 && "What do you like to read?"}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {step === 1 && "Let's personalize your experience."}
                            {step === 2 && "Challenge yourself to read more this year."}
                            {step === 3 && "We'll suggest books based on your taste."}
                        </p>
                    </div>

                    {/* Step 1: Name */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="e.g. Jane Doe"
                                    className="w-full px-4 py-3 bg-[#141b3d] border border-[#1e2749] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleNext}
                                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Step 2: Goal */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-4">
                                <span className="text-6xl font-bold text-white mb-4">{formData.reading_goal}</span>
                                <span className="text-slate-400 uppercase tracking-widest text-xs font-bold">Books in {new Date().getFullYear()}</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={formData.reading_goal}
                                    onChange={e => setFormData({ ...formData, reading_goal: parseInt(e.target.value) })}
                                    className="w-full mt-8 h-2 bg-[#1e2749] rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                            </div>
                            <button
                                onClick={handleNext}
                                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Step 3: Genres */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                {GENRES.map(genre => (
                                    <button
                                        key={genre}
                                        onClick={() => toggleGenre(genre)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${formData.favorite_genres.includes(genre)
                                            ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/25'
                                            : 'bg-[#141b3d] text-slate-400 border-[#1e2749] hover:border-slate-600'
                                            }`}
                                    >
                                        {genre}
                                        {formData.favorite_genres.includes(genre) && <Check className="inline-block w-3 h-3 ml-1" />}
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-xs text-slate-500">
                                {formData.favorite_genres.length}/3 selected
                            </p>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || formData.favorite_genres.length < 3}
                                className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Complete Setup
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
