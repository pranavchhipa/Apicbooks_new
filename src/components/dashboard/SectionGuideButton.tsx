'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, X, Zap, Book, Users, Search, Lightbulb, Star, Shield, Target, BookMarked, FileText, MessageSquare } from 'lucide-react';

type SectionType = 'pulse' | 'my-books' | 'community' | 'discover' | 'journal';

interface SectionContent {
    title: string;
    description: string;
    icon: any;
    color: string;
    features: {
        title: string;
        desc: string;
        icon: any;
    }[];
}

const SECTION_CONTENT: Record<SectionType, SectionContent> = {
    pulse: {
        title: "Pulse",
        description: "The heartbeat of the community. See what's happening right now.",
        icon: Zap,
        color: "text-accent-400",
        features: [
            {
                title: "Live Activity",
                desc: "See real-time updates when friends start books, finish them, or write reviews.",
                icon: Zap
            },
            {
                title: "Social Graph",
                desc: "Follow other readers to build a personalized feed of recommendations.",
                icon: Users
            },
            {
                title: "System Trends",
                desc: "Stay updated on trending books being added to libraries across the platform.",
                icon: TrendingUpIcon
            }
        ]
    },
    'my-books': {
        title: "My Books",
        description: "Your personal library and reading tracker.",
        icon: Book,
        color: "text-primary-400",
        features: [
            {
                title: "Organize Shelves",
                desc: "Categorize books into Reading, Want to Read, and Finished lists.",
                icon: Book
            },
            {
                title: "Track Progress",
                desc: "Update your current page number and see your completion percentage.",
                icon: Target
            },
            {
                title: "Smart Management",
                desc: "Quickly move books between statuses or remove them from your collection.",
                icon: Shield
            }
        ]
    },
    community: {
        title: "Community",
        description: "Connect with fellow book lovers.",
        icon: Users,
        color: "text-purple-400",
        features: [
            {
                title: "Find Friends",
                desc: "Discover users with similar reading tastes and follow them.",
                icon: Search
            },
            {
                title: "Compare Stats",
                desc: "See how your reading streaks and goals stack up against others.",
                icon: TrophyIcon
            },
            {
                title: "Share Reviews",
                desc: "Write reviews and get feedback from the community.",
                icon: Star
            }
        ]
    },
    discover: {
        title: "Discover",
        description: "Find your next great read.",
        icon: Search,
        color: "text-emerald-400",
        features: [
            {
                title: "Smart Search",
                desc: "Search by title, author, or ISBN to find specific books.",
                icon: Search
            },
            {
                title: "Recommendations",
                desc: "Get suggestions based on your reading history and preferences.",
                icon: Lightbulb
            },
            {
                title: "Explore Genres",
                desc: "Browse curated collections across varying genres and topics.",
                icon: Book
            }
        ]
    },
    journal: {
        title: "Journal",
        description: "Your reading thoughts, notes, and reviews in one place.",
        icon: BookMarked,
        color: "text-violet-400",
        features: [
            {
                title: "Session Notes",
                desc: "Notes from your reading sessions are automatically collected here with page references.",
                icon: FileText
            },
            {
                title: "Reviews & Ratings",
                desc: "All your book reviews and star ratings organized for easy browsing.",
                icon: Star
            },
            {
                title: "Search & Filter",
                desc: "Quickly find specific notes or reviews by searching across all your entries.",
                icon: Search
            }
        ]
    }
};

// Helper icons needed for the object above (if not imported directly in the value)
function TrendingUpIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>; }
function TrophyIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>; }

export default function SectionGuideButton({ section }: { section: SectionType }) {
    const [isOpen, setIsOpen] = useState(false);
    const content = SECTION_CONTENT[section];

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-xl bg-elevated/50 hover:bg-elevated border border-card-border text-muted-foreground hover:text-foreground transition-all duration-300 group ml-2"
                title={`${content.title} Guide`}
            >
                <Info className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            {isOpen && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="w-full max-w-lg bg-secondary dark:bg-[#0c0a14] border border-card-border rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative p-6 bg-gradient-to-br from-[#141b3d] to-[#0a0e27] border-b border-card-border">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full pointer-events-none" />

                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-colors z-50"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`p-3 rounded-xl bg-elevated border border-[#2a3459] shadow-lg ${content.color}`}>
                                    <content.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">{content.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {content.features.map((feature, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className={`mt-1 p-2 rounded-lg bg-elevated/50 group-hover:bg-elevated transition-colors h-fit ${content.color}`}>
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground text-base group-hover:text-primary-300 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-card-border bg-[#0d1233] flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2 rounded-xl bg-elevated hover:bg-[#2a3459] text-foreground text-sm font-medium transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
