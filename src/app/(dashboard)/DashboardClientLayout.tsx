'use client';

import { useState, useEffect } from 'react';
import { Menu, Flame } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileTabBar from '@/components/MobileTabBar';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { SearchProvider } from '@/contexts/SearchContext';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/api/user';
import { RealtimeChannel } from '@supabase/supabase-js';

// This file is now a CLIENT COMPONENT WRAPPER
// It accepts server-fetched user and profile as props

interface DashboardClientLayoutProps {
    children: React.ReactNode;
    initialUser: any;
    initialProfile: UserProfile | null;
}

export default function DashboardClientLayout({ children, initialUser, initialProfile }: DashboardClientLayoutProps) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
    const [user] = useState<any>(initialUser);
    const [streak, setStreak] = useState(initialProfile?.current_streak || 0);

    useEffect(() => {
        let mounted = true;
        let subscriptionChannel: RealtimeChannel | null = null;
        const supabase = createClient();

        if (user && mounted) {
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

        return () => {
            mounted = false;
            if (subscriptionChannel) {
                supabase.removeChannel(subscriptionChannel);
            }
        };
    }, [user]);

    return (
        <SearchProvider>
            <CurrencyProvider>
                <div className="min-h-screen relative lg:flex lg:flex-row">
                    {/* Floating Background Orbs — subtle in both themes */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-20 left-10 w-96 h-96 bg-[#7c5cfc]/5 dark:bg-[#7c5cfc]/10 rounded-full blur-3xl animate-float" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#e8914f]/5 dark:bg-[#f0a45d]/8 rounded-full blur-3xl animate-float-delayed" />
                        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#9b7aff]/3 dark:bg-[#9b7aff]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-5s' }} />
                    </div>

                    {/* Mobile Sidebar Overlay */}
                    {isMobileSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-[#0c0a14]/60 backdrop-blur-sm z-40 lg:hidden"
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
                    <div className={`flex-1 min-h-screen flex flex-col relative z-10 transition-all duration-300 min-w-0`}>
                        {/* Header — theme responsive */}
                        <header className="h-16 bg-white/70 dark:bg-[#161222]/80 backdrop-blur-xl border-b border-[#e0d5c7]/60 dark:border-[#2d2545]/40 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-300">
                            <button
                                onClick={() => setIsMobileSidebarOpen(true)}
                                className="p-2 text-[#8b7355] dark:text-[#a39484] hover:text-[#2c1810] dark:hover:text-[#f5f0eb] hover:bg-[#f3efe8] dark:hover:bg-[#241e36] rounded-xl transition-colors lg:hidden"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            <div className="ml-auto flex items-center gap-6">
                                {/* Streak Flame */}
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/15" title="Reading streak">
                                    <div className="relative">
                                        <Flame className="w-5 h-5 text-amber-500 dark:text-amber-400/60 relative" />
                                    </div>
                                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400/60">{streak}</span>
                                </div>

                                {/* User Avatar - clickable link to profile */}
                                <Link href="/profile" className="block">
                                    {(profile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-[#e0d5c7] dark:border-[#2d2545] hover:border-[#7c5cfc]/50 transition-colors shadow-lg cursor-pointer">
                                            <Image
                                                src={profile?.avatar_url || user.user_metadata.avatar_url}
                                                alt="User Avatar"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl border-2 border-[#e0d5c7] dark:border-[#2d2545] hover:border-[#7c5cfc]/50 transition-colors cursor-pointer flex items-center justify-center">
                                            <span className="text-sm font-bold text-[#7c5cfc] dark:text-[#9b7aff]">
                                                {(profile?.full_name || user?.email)?.[0]?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            </div>
                        </header>

                        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
                            {children}
                        </main>
                    </div>

                    {/* Mobile Bottom Tab Bar */}
                    <MobileTabBar />
                </div>
            </CurrencyProvider>
        </SearchProvider>
    );
}
