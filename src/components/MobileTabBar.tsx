'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Library, Compass, Users, UserCircle, BookMarked } from 'lucide-react';

const tabs = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'Library', href: '/my-books', icon: Library },
    { name: 'Journal', href: '/journal', icon: BookMarked },
    { name: 'Friends', href: '/friends', icon: Users },
];

export default function MobileTabBar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0c0a14]/95 backdrop-blur-xl border-t border-[#2d2545]/60 safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`
                                flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'text-[#9b7aff]'
                                    : 'text-[#a39484]/60 hover:text-[#a39484]'
                                }
                            `}
                        >
                            <div className={`
                                relative p-1.5 rounded-xl transition-all
                                ${isActive ? 'bg-[#7c5cfc]/15' : ''}
                            `}>
                                <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                                {isActive && (
                                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#9b7aff]" />
                                )}
                            </div>
                            <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
