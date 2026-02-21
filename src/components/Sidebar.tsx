'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Library, Settings, UserCircle, LogOut, Compass, ChevronLeft, Activity, Users, BookMarked } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Logo, { LogoIcon } from './Logo';
import ThemeToggle from '@/components/ThemeToggle';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
        router.refresh();
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Discover', href: '/discover', icon: Compass },
        { name: 'My Books', href: '/my-books', icon: Library },
        { name: 'Journal', href: '/journal', icon: BookMarked },
        { name: 'Community', href: '/friends', icon: Users },
        { name: 'Pulse', href: '/pulse', icon: Activity },
        { name: 'Profile', href: '/profile', icon: UserCircle },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <aside className={`
            fixed lg:sticky top-0 lg:top-4 left-0 bottom-0 lg:bottom-auto lg:h-[calc(100vh-2rem)] z-50 transform transition-all duration-300 flex-shrink-0
            bg-white/90 dark:bg-[#161222]/90 lg:bg-white/70 lg:dark:bg-[#161222]/80 backdrop-blur-xl
            border-r lg:border border-[#e0d5c7]/60 dark:border-[#2d2545]/40
            lg:rounded-2xl lg:ml-4 lg:shadow-xl
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}>
            <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
                {/* Logo */}
                <div className="h-16 flex items-center border-b border-[#e0d5c7]/60 dark:border-[#2d2545]/40 overflow-hidden justify-center px-3">
                    <Link href="/dashboard" className="flex items-center group flex-shrink-0">
                        {isCollapsed ? (
                            <LogoIcon className="w-10 h-10 hover:scale-105 transition-transform" />
                        ) : (
                            <Logo className="w-48" />
                        )}
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-[#a39484] hover:text-[#f5f0eb] transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex p-1 text-[#8b7355] hover:text-[#2c1810] dark:text-[#a39484] dark:hover:text-[#f5f0eb] transition-colors absolute -right-3 top-20 bg-white dark:bg-[#241e36] rounded-full border border-[#e0d5c7] dark:border-[#2d2545] shadow-lg z-50"
                        title={isCollapsed ? "Expand" : "Collapse"}
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-6 space-y-1.5">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative
                                    ${isActive
                                        ? 'bg-gradient-to-r from-[#7c5cfc] to-[#9b7aff] text-white shadow-lg shadow-[#7c5cfc]/25'
                                        : 'text-[#8b7355] hover:text-[#2c1810] hover:bg-[#f3efe8] dark:text-[#a39484] dark:hover:text-[#f5f0eb] dark:hover:bg-[#241e36]/60'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? item.name : ''}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0`} />
                                {!isCollapsed && <span className="truncate text-sm font-medium">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Theme Toggle */}
                <div className={`px-3 py-2 border-t border-[#e0d5c7]/60 dark:border-[#2d2545]/40 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <ThemeToggle />
                </div>

                {/* User & Logout */}
                <div className="p-4 border-t border-[#e0d5c7]/60 dark:border-[#2d2545]/40">
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full flex items-center gap-3 px-4 py-2.5 text-[#8b7355] dark:text-[#a39484] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? "Sign Out" : ''}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="truncate text-sm font-medium">Sign Out</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
