'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Home,
    Compass,
    BookOpen,
    Users,
    Bookmark,
    User,
    Search,
    Bell,
    Menu,
    X,
    Plus,
    Library,
    Star,
    LogOut,
    ChevronLeft,
    Settings,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/api/user';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { RealtimeChannel } from '@supabase/supabase-js';
import Logo, { LogoIcon } from '@/components/Logo';

interface DashboardClientLayoutProps {
    children: React.ReactNode;
    initialUser: any;
    initialProfile: UserProfile | null;
}

const mainNavigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'My Library', href: '/my-books', icon: Library },
    { name: 'Clubs', href: '/friends', icon: Users },
    { name: 'Folios', href: '/pulse', icon: Bookmark },
    { name: 'Profile', href: '/profile', icon: User },
];

const mobileTabNav = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'Library', href: '/my-books', icon: Library },
    { name: 'Clubs', href: '/friends', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
];

export default function DashboardClientLayout({
    children,
    initialUser,
    initialProfile,
}: DashboardClientLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
    const [user] = useState<any>(initialUser);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [notificationCount] = useState(0);

    // Realtime profile subscription
    useEffect(() => {
        let mounted = true;
        let subscriptionChannel: RealtimeChannel | null = null;
        const supabase = createClient();

        if (user && mounted) {
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

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
        router.refresh();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Reader';
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <SearchProvider>
            <CurrencyProvider>
                <div className="min-h-screen bg-midnight">
                    {/* ============================================= */}
                    {/* MOBILE SIDEBAR OVERLAY                        */}
                    {/* ============================================= */}
                    {isMobileSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        />
                    )}

                    {/* ============================================= */}
                    {/* LEFT SIDEBAR                                   */}
                    {/* ============================================= */}
                    <aside
                        className={`
                            fixed top-0 left-0 bottom-0 z-50 bg-surface border-r border-white/[0.04]
                            transform transition-all duration-300 ease-in-out
                            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                            ${isDesktopCollapsed ? 'w-[72px]' : 'w-60'}
                        `}
                    >
                        <div className="h-full flex flex-col">
                            {/* Sidebar Header - Logo */}
                            <div className="h-16 flex items-center justify-between border-b border-white/[0.06] px-4">
                                <Link href="/dashboard" className="flex items-center flex-1 min-w-0">
                                    {isDesktopCollapsed ? (
                                        <LogoIcon className="w-9 h-9 flex-shrink-0" />
                                    ) : (
                                        <span className="font-display font-extrabold text-white text-xl tracking-tight">
                                            ApicBooks
                                        </span>
                                    )}
                                </Link>

                                {/* Mobile close */}
                                <button
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Desktop collapse toggle */}
                            <button
                                onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                                className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center
                                    bg-surface border border-white/[0.06] rounded-full shadow-sm
                                    text-white/30 hover:text-white hover:border-white/[0.12] transition-colors z-50"
                                title={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${isDesktopCollapsed ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Navigation Links */}
                            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                                {mainNavigation.map((item) => {
                                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                                                ${isActive
                                                    ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500'
                                                    : 'text-white/40 hover:text-white hover:bg-white/[0.04] border-l-2 border-transparent'
                                                }
                                                ${isDesktopCollapsed ? 'justify-center' : ''}
                                            `}
                                            title={isDesktopCollapsed ? item.name : ''}
                                        >
                                            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-white/30 group-hover:text-white/60'}`} />
                                            {!isDesktopCollapsed && (
                                                <span className="text-sm font-sans font-medium truncate">{item.name}</span>
                                            )}
                                            {/* Active indicator dot for collapsed state */}
                                            {isActive && isDesktopCollapsed && (
                                                <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-glow-sm" />
                                            )}
                                        </Link>
                                    );
                                })}

                                {/* Divider */}
                                {!isDesktopCollapsed && (
                                    <div className="pt-4 pb-2 px-3">
                                        <div className="h-px bg-white/[0.06]" />
                                    </div>
                                )}

                                {/* Settings Link */}
                                <Link
                                    href="/settings"
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                                        ${pathname === '/settings'
                                            ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500'
                                            : 'text-white/40 hover:text-white hover:bg-white/[0.04] border-l-2 border-transparent'
                                        }
                                        ${isDesktopCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isDesktopCollapsed ? 'Settings' : ''}
                                >
                                    <Settings className={`w-5 h-5 flex-shrink-0 ${pathname === '/settings' ? 'text-amber-400' : 'text-white/30 group-hover:text-white/60'}`} />
                                    {!isDesktopCollapsed && (
                                        <span className="text-sm font-sans font-medium">Settings</span>
                                    )}
                                </Link>
                            </nav>

                            {/* Sidebar Footer */}
                            <div className="p-3 border-t border-white/[0.06]">
                                {/* Quick Add Button */}
                                {!isDesktopCollapsed && (
                                    <Link
                                        href="/discover"
                                        className="flex items-center justify-center gap-2 w-full mb-3 px-4 py-2.5
                                            bg-amber-500 text-black rounded-lg text-sm font-sans font-semibold
                                            hover:bg-amber-400 transition-colors shadow-glow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add a Book
                                    </Link>
                                )}
                                {isDesktopCollapsed && (
                                    <Link
                                        href="/discover"
                                        className="flex items-center justify-center w-full mb-3 p-2.5
                                            bg-amber-500 text-black rounded-lg
                                            hover:bg-amber-400 transition-colors shadow-glow-sm"
                                        title="Add a Book"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </Link>
                                )}

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                        text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
                                        ${isDesktopCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isDesktopCollapsed ? 'Sign Out' : ''}
                                >
                                    <LogOut className="w-5 h-5 flex-shrink-0" />
                                    {!isDesktopCollapsed && <span className="text-sm font-sans font-medium">Sign Out</span>}
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* ============================================= */}
                    {/* MAIN CONTENT AREA                              */}
                    {/* ============================================= */}
                    <div
                        className={`
                            min-h-screen flex flex-col transition-all duration-300 bg-midnight
                            ${isDesktopCollapsed ? 'lg:ml-[72px]' : 'lg:ml-60'}
                        `}
                    >
                        {/* ========================================= */}
                        {/* TOP BAR                                    */}
                        {/* ========================================= */}
                        <header className="h-16 bg-midnight/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
                            {/* Left side: Mobile menu + Search */}
                            <div className="flex items-center gap-3 flex-1">
                                {/* Mobile menu hamburger */}
                                <button
                                    onClick={() => setIsMobileSidebarOpen(true)}
                                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors lg:hidden"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>

                                {/* Mobile logo */}
                                <span className="font-display font-extrabold text-white text-lg tracking-tight lg:hidden">
                                    ApicBooks
                                </span>

                                {/* Search Input */}
                                <form onSubmit={handleSearch} className="relative max-w-md w-full hidden sm:block">
                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused ? 'text-amber-400' : 'text-white/30'}`} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setSearchFocused(false)}
                                        placeholder="Search books, authors, genres..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]
                                            text-sm text-white placeholder:text-white/30 font-sans
                                            focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:bg-white/[0.05]
                                            transition-all duration-200"
                                    />
                                </form>
                            </div>

                            {/* Right side: Notifications + Avatar */}
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* Mobile search button */}
                                <Link
                                    href="/discover"
                                    className="sm:hidden p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
                                >
                                    <Search className="w-5 h-5" />
                                </Link>

                                {/* Notification Bell */}
                                <button
                                    className="relative p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
                                    title="Notifications"
                                >
                                    <Bell className="w-5 h-5" />
                                    {notificationCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center
                                            bg-amber-500 text-black text-[10px] font-bold rounded-full shadow-glow-sm">
                                            {notificationCount > 9 ? '9+' : notificationCount}
                                        </span>
                                    )}
                                </button>

                                {/* User Avatar */}
                                <Link href="/profile" className="block flex-shrink-0">
                                    {avatarUrl ? (
                                        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white/[0.06] hover:border-amber-500/50 transition-colors">
                                            <Image
                                                src={avatarUrl}
                                                alt={displayName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center
                                            hover:bg-violet-400 transition-colors cursor-pointer">
                                            <span className="text-sm font-semibold text-white">{initials}</span>
                                        </div>
                                    )}
                                </Link>
                            </div>
                        </header>

                        {/* ========================================= */}
                        {/* PAGE CONTENT                               */}
                        {/* ========================================= */}
                        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                            {children}
                        </main>
                    </div>

                    {/* ============================================= */}
                    {/* MOBILE BOTTOM TAB BAR                          */}
                    {/* ============================================= */}
                    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-midnight/90 backdrop-blur-xl border-t border-white/[0.04] safe-area-bottom">
                        <div className="flex items-center justify-around h-16 px-2">
                            {mobileTabNav.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                                            flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg min-w-0 flex-1
                                            transition-colors duration-200
                                            ${isActive
                                                ? 'text-amber-400'
                                                : 'text-white/30 hover:text-white/60'
                                            }
                                        `}
                                    >
                                        <div className={`relative p-1 rounded-lg ${isActive ? 'bg-amber-500/10' : ''}`}>
                                            <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : ''}`} />
                                        </div>
                                        <span className={`text-[10px] font-sans font-medium truncate ${isActive ? 'text-amber-400' : ''}`}>
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </div>
            </CurrencyProvider>
        </SearchProvider>
    );
}
