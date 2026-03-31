'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, updateUserProfile } from '@/lib/api/user';
import Image from 'next/image';
import {
    Globe,
    Palette,
    Shield,
    Loader2,
    Save,
    ChevronRight,
    Check,
    Moon,
    Sun,
    Sparkles,
    Lock,
    Trash2,
    ExternalLink,
    Info
} from 'lucide-react';
import { REGIONS, DEFAULT_PREFERENCES } from '@/lib/constants';
import { toast } from 'sonner';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { theme, setTheme } = useTheme();

    const { setRegion: setGlobalRegion, region: currentRegion } = useCurrency();
    const [region, setRegion] = useState(DEFAULT_PREFERENCES.region);

    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const profile = await getUserProfile(user.id);
                    if (profile?.preferences?.region) {
                        setRegion(profile.preferences.region);
                    }
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleSave = async () => {
        setSaving(true);

        try {
            if (!user) throw new Error('Not authenticated');

            const regionObj = REGIONS.find(r => r.code === region) || REGIONS[0];

            await updateUserProfile(user.id, {
                preferences: {
                    region: regionObj.code,
                    currency: regionObj.currency
                }
            });

            toast.success('Settings saved!', {
                description: `Region set to ${regionObj.name}`,
                icon: <Check className="w-4 h-4 text-emerald-400" />
            });

            setGlobalRegion(regionObj.code);
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to save settings', {
                description: error.message
            });
        } finally {
            setSaving(false);
        }
    };

    const selectedRegion = REGIONS.find(r => r.code === region) || REGIONS[0];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-white/[0.03] animate-pulse" />
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-white/40 text-sm">Loading preferences...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            {/* Header */}
            <header className="mb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                            Settings
                        </h1>
                        <p className="text-white/40">Personalize your ApicBooks experience</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="hidden md:flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-semibold rounded-full hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Main Settings */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Region & Currency Card */}
                    <section className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <Globe className="w-6 h-6 text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-white">Region & Currency</h2>
                                    <p className="text-white/40 text-sm">Set your location for accurate pricing</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {REGIONS.map((r) => (
                                    <button
                                        key={r.code}
                                        type="button"
                                        onClick={() => setRegion(r.code)}
                                        className={`relative p-4 rounded-xl border transition-all duration-200 text-left group/item ${region === r.code
                                            ? 'bg-amber-500/10 border-amber-500/20 ring-1 ring-amber-500/20'
                                            : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="relative w-8 h-6 rounded overflow-hidden shadow-sm">
                                                <Image
                                                    src={`https://flagcdn.com/w160/${r.code.toLowerCase()}.png`}
                                                    alt={r.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            {region === r.code && (
                                                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-black" />
                                                </div>
                                            )}
                                        </div>
                                        <p className={`font-medium ${region === r.code ? 'text-amber-400' : 'text-white/60'}`}>
                                            {r.name}
                                        </p>
                                        <p className="text-sm text-white/30 mt-1">
                                            {r.symbol} {r.currency}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                                <Info className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                                <div className="text-sm text-white/60">
                                    <p>Changing your region will update book prices to <span className="text-amber-400 font-medium">{selectedRegion.symbol} {selectedRegion.currency}</span>.</p>
                                    <p className="mt-1 text-white/30">Your existing library items won&apos;t be affected.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Appearance Card */}
                    <section className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 transition-all duration-300">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                <Palette className="w-6 h-6 text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Appearance</h2>
                                <p className="text-white/40 text-sm">Theme preferences</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setTheme('light')}
                                className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-200 ${theme === 'light'
                                    ? 'bg-amber-500/10 border-amber-500/20 ring-1 ring-amber-500/20'
                                    : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                                    }`}
                            >
                                <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-amber-400' : 'text-white/30'}`} />
                                <span className={`${theme === 'light' ? 'text-amber-400 font-medium' : 'text-white/40'}`}>Light Mode</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTheme('dark')}
                                className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-200 ${theme === 'dark'
                                    ? 'bg-amber-500/10 border-amber-500/20 ring-1 ring-amber-500/20'
                                    : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                                    }`}
                            >
                                <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-white/30'}`} />
                                <span className={`${theme === 'dark' ? 'text-amber-400 font-medium' : 'text-white/40'}`}>Dark Mode</span>
                            </button>
                        </div>
                    </section>
                </div>

                {/* Right Column - Account & Quick Actions */}
                <div className="space-y-6">
                    {/* Account Info Card */}
                    <section className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Account</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                                    <span className="text-sm font-bold text-black">
                                        {user?.email?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{user?.email || 'Not signed in'}</p>
                                    <p className="text-xs text-white/30">Member since Jan 2026</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-left hover:border-white/[0.12] transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-white/30" />
                                    <span className="text-sm text-white/60">Change Password</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                            </button>
                        </div>
                    </section>

                    {/* Current Selection Summary */}
                    <section className="bg-surface border border-white/[0.06] rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-semibold text-white">Your Preferences</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                <span className="text-sm text-white/40">Region</span>
                                <span className="text-sm font-medium text-white flex items-center gap-2">
                                    <div className="relative w-5 h-3.5 rounded-sm overflow-hidden">
                                        <Image
                                            src={`https://flagcdn.com/w80/${region.toLowerCase()}.png`}
                                            alt={region}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {selectedRegion.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                <span className="text-sm text-white/40">Currency</span>
                                <span className="text-sm font-medium text-white">
                                    {selectedRegion.symbol} {selectedRegion.currency}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-white/40">Theme</span>
                                <span className="text-sm font-medium text-white capitalize">{theme || 'System'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-5 h-5 text-rose-400" />
                            <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
                        </div>

                        <button
                            type="button"
                            disabled
                            className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-left opacity-60 cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 className="w-4 h-4 text-rose-400" />
                                <span className="text-sm text-rose-400">Delete Account</span>
                            </div>
                            <span className="text-[10px] text-white/30">Contact Support</span>
                        </button>
                    </section>

                    {/* Help & Support */}
                    <section className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Help & Support</h3>

                        <div className="space-y-2">
                            <a
                                href="#"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
                            >
                                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Documentation</span>
                                <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                            </a>
                            <a
                                href="#"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
                            >
                                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Report a Bug</span>
                                <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                            </a>
                            <a
                                href="#"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
                            >
                                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Feature Request</span>
                                <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                            </a>
                        </div>
                    </section>
                </div>
            </div>

            {/* Mobile Save Button */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-black font-semibold rounded-full shadow-xl transition-all disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
