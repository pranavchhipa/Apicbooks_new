'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { updateUserProfile, uploadAvatar, UserProfile } from '@/lib/api/user';
import { Camera, Loader2, Save, X, User, Target } from 'lucide-react';
import Image from 'next/image';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    profile: UserProfile | null;
    onProfileUpdate: (newProfile: UserProfile) => void;
}

export default function EditProfileModal({ isOpen, onClose, user, profile, onProfileUpdate }: EditProfileModalProps) {
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [website, setWebsite] = useState(profile?.website || '');
    const [location, setLocation] = useState(profile?.location || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [readingGoal, setReadingGoal] = useState(profile?.reading_goal || 12);
    const [favoriteGenres, setFavoriteGenres] = useState<string[]>(profile?.favorite_genres || []);

    const GENRES = [
        'Fiction', 'Non-Fiction', 'Mystery', 'Sci-Fi', 'Fantasy', 'Romance',
        'Biography', 'History', 'Business', 'Self-Help', 'Thriller', 'Young Adult',
        'Horror', 'Science', 'Travel', 'Crime'
    ];

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let avatarUrl = profile?.avatar_url;
            if (avatarFile && user) {
                avatarUrl = await uploadAvatar(user.id, avatarFile);
            }

            const updates: Partial<UserProfile> = {
                full_name: fullName,
                bio,
                website,
                location,
                avatar_url: avatarUrl,
                reading_goal: readingGoal,
                favorite_genres: favoriteGenres
            };

            const updatedProfile = await updateUserProfile(user.id, updates);
            // manually merge because upsert might return only updated fields depending on query
            // but our api returns full object
            onProfileUpdate(updatedProfile as UserProfile);
            onClose();
        } catch (error) {
            console.error('Failed to save profile', error);
            toast.error('Failed to save profile changes.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl bg-[#0a0e27] border border-[#1e2749] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#1e2749] bg-[#141b3d]/50 shrink-0">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-400" />
                        Edit Profile
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#1e2749] text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-8 overflow-y-auto custom-scrollbar grow">

                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-28 h-28 rounded-full bg-slate-800 border-4 border-[#1e2749] overflow-hidden group">
                            {previewUrl || profile?.avatar_url ? (
                                <Image
                                    src={previewUrl || profile?.avatar_url || ''}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl text-slate-500 font-bold bg-slate-800">
                                    {(fullName || user?.email)?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="w-8 h-8 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500">Tap to change</p>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-[#141b3d] border border-[#1e2749] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full bg-[#141b3d] border border-[#1e2749] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-[#141b3d] border border-[#1e2749] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="City, Country"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Website</label>
                                <input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="w-full bg-[#141b3d] border border-[#1e2749] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="https://"
                                />
                            </div>
                        </div>

                        {/* Reading Preferences */}
                        <div className="pt-4 border-t border-[#1e2749]">
                            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4 text-accent-400" />
                                Reading Preferences
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Annual Reading Goal</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            value={readingGoal}
                                            onChange={(e) => setReadingGoal(parseInt(e.target.value) || 0)}
                                            className="w-24 bg-[#141b3d] border border-[#1e2749] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors text-center font-bold"
                                        />
                                        <span className="text-sm text-slate-500">books per year</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">Favorite Genres</label>
                                    <div className="flex flex-wrap gap-2">
                                        {GENRES.map(genre => (
                                            <button
                                                key={genre}
                                                type="button"
                                                onClick={() => {
                                                    setFavoriteGenres(prev =>
                                                        prev.includes(genre)
                                                            ? prev.filter(g => g !== genre)
                                                            : [...prev, genre]
                                                    );
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${favoriteGenres.includes(genre)
                                                    ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                                                    : 'bg-[#141b3d] text-slate-400 border-[#1e2749] hover:border-slate-600'
                                                    }`}
                                            >
                                                {genre}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2">
                                        Select at least 3 genres for better recommendations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-[#1e2749] bg-[#141b3d]/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-slate-300 hover:bg-[#1e2749] transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-primary px-8 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
