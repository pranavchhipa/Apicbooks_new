'use client';

import { useState, useEffect } from 'react';
import { Menu, Flame } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, UserProfile } from '@/lib/api/user';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { SearchProvider } from '@/contexts/SearchContext';
import Image from 'next/image';
import Link from 'next/link';
import { RealtimeChannel } from '@supabase/supabase-js';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [user, setUser] = useState<any>(null); // Store full user for metadata fallback
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        let mounted = true;
        let subscriptionChannel: RealtimeChannel | null = null;

        const fetchUser = async () => {
            try {
                const supabase = createClient();
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error) throw error;

                if (user && mounted) {
                    setUser(user);
                    const userProfile = await getUserProfile(user.id);
                    if (mounted) {
                        setProfile(userProfile);

                        // Fetch streak
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('current_streak')
                            .eq('id', user.id)
                            .single();

                        if (profileData && mounted) {
                            setStreak(profileData.current_streak || 0);
                        }

                        // Sync Avatar from Auth to Profile if missing
                        const authAvatar = user.user_metadata?.avatar_url;
                        if (authAvatar && !userProfile?.avatar_url) {
                            console.log("Syncing avatar from auth...");
                            import('@/lib/api/user').then(async ({ updateUserProfile }) => {
                                try {
                                    const updated = await updateUserProfile(user.id, { avatar_url: authAvatar });
                                    if (mounted) setProfile(updated);
                                } catch (e) {
                                    console.error("Avatar sync failed", e);
                                }
                            });
                        }

                        // Realtime Subscription
                        subscriptionChannel = supabase
                            .channel('profile-changes-layout')
                            .on(
                                'postgres_changes',
                                {
                                    event: 'UPDATE',
                                    schema: 'public',
                                    table: 'profiles',
                                    filter: `id=eq.${user.id}`,
                                },
                                (payload) => {
                                    if (mounted && payload.new) {
                                        setProfile((prev) => ({ ...prev, ...(payload.new as any) }));
                                        if (payload.new.current_streak !== undefined) {
                                            setStreak(payload.new.current_streak);
                                        }
                                    }
                                }
                            )
                            .subscribe();
                    }
                }
            } catch (error: any) {
                if (error.name === 'AbortError' || error.message?.includes('aborted') || error.message?.includes('lock')) return;
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();

        return () => {
            mounted = false;
            if (subscriptionChannel) {
                const supabase = createClient();
                supabase.removeChannel(subscriptionChannel);
            }
        };
    }, []);

    return (
        <SearchProvider>
            <CurrencyProvider>
                <div className="min-h-screen bg-background relative">
                    {/* ... content ... */}
                    {/* Floating Background Orbs */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float-delayed" />
                        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-5s' }} />
                    </div>

                    {/* Mobile Sidebar Overlay */}
                    {isMobileSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar Component */}
                    <Sidebar
                        isOpen={isMobileSidebarOpen}
                        onClose={() => setIsMobileSidebarOpen(false)}
                        isCollapsed={isDesktopCollapsed}
                        onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                    />

                    {/* Main Content */}
                    <div className={`min-h-screen flex flex-col relative z-10 transition-all duration-300 ${isDesktopCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                        {/* Header */}
                        <header className="h-16 bg-white/80 dark:bg-[#0a0e27]/80 backdrop-blur-xl border-b border-slate-200 dark:border-[#1e2749] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
                            <button
                                onClick={() => setIsMobileSidebarOpen(true)}
                                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e2749] rounded-xl transition-colors lg:hidden"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            <div className="ml-auto flex items-center gap-6">
                                {/* Streak Flame */}
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning-500/10 border border-warning-500/20" title="Streak tracking coming soon!">
                                    <div className="relative">
                                        <Flame className="w-5 h-5 text-warning-400/50 relative" />
                                    </div>
                                    <span className="text-sm font-bold text-warning-400/50">{streak}</span>
                                </div>

                                {/* User Avatar - clickable link to profile */}
                                <Link href="/profile" className="block">
                                    {(profile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-primary-500/30 hover:border-primary-500/50 transition-colors shadow-lg shadow-primary-500/10 cursor-pointer">
                                            <Image
                                                src={profile?.avatar_url || user.user_metadata.avatar_url}
                                                alt="User Avatar"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 hover:border-primary-500/50 transition-colors cursor-pointer flex items-center justify-center">
                                            <span className="text-sm font-bold text-primary-400">
                                                {(profile?.full_name || user?.email)?.[0]?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            </div>
                        </header>

                        <main className="flex-1 p-4 sm:p-6 lg:p-8">
                            {children}
                        </main>
                    </div>
                </div>
            </CurrencyProvider>
        </SearchProvider>
    );
}
