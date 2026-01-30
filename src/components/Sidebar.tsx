'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Library, Settings, UserCircle, LogOut, Compass, ChevronLeft, Activity, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Logo, { LogoIcon } from './Logo';

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
        { name: 'Community', href: '/friends', icon: Users },
        { name: 'Pulse', href: '/pulse', icon: Activity },
        { name: 'Profile', href: '/profile', icon: UserCircle },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <aside className={`
            fixed top-0 left-0 bottom-0 bg-white dark:bg-[#0a0e27] border-r border-slate-200 dark:border-[#1e2749] z-50 transform transition-all duration-300
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}>
            <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
                <div className="h-16 flex items-center border-b border-slate-200 dark:border-[#1e2749] overflow-hidden justify-center p-0">
                    <Link href="/dashboard" className="flex items-center group w-full h-full">
                        {isCollapsed ? (
                            <LogoIcon className="w-full h-full hover:scale-105 transition-transform" />
                        ) : (
                            <Logo className="w-full h-full" />
                        )}
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors absolute -right-3 top-20 bg-white dark:bg-[#1e2749] rounded-full border border-slate-200 dark:border-[#2d3a6e] shadow-lg z-50"
                        title={isCollapsed ? "Expand" : "Collapse"}
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-6 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative
                                    ${isActive
                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e2749]'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? item.name : ''}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0`} />
                                {!isCollapsed && <span className="truncate">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User & Logout */}
                <div className="p-4 border-t border-slate-200 dark:border-[#1e2749]">
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? "Sign Out" : ''}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="truncate">Sign Out</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
