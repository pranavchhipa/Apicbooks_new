'use client';

import { ExternalLink, ShoppingCart, Store, BookOpen, Tag } from 'lucide-react';

interface RetailerLink {
    name: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    getUrl: (isbn: string, title: string, author?: string) => string;
    description: string;
}

const RETAILERS: RetailerLink[] = [
    {
        name: 'Amazon',
        icon: <ShoppingCart className="w-5 h-5" />,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/60',
        getUrl: (isbn, title) => `https://www.amazon.in/s?k=${isbn || encodeURIComponent(title)}`,
        description: 'New & Used books with fast delivery'
    },
    {
        name: 'Flipkart',
        icon: <Store className="w-5 h-5" />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60',
        getUrl: (isbn, title, author) => {
            // Clean title and append "book" to guide Flipkart's search engine
            const cleanTitle = title.replace(/\s*\(.*?\)\s*/g, '').trim();
            return `https://www.flipkart.com/search?q=${encodeURIComponent(cleanTitle + (author ? ' ' + author : '') + ' book')}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off`;
        },
        description: 'Great deals for Indian buyers'
    },
    {
        name: 'Google Books',
        icon: <BookOpen className="w-5 h-5" />,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/30 hover:border-green-500/60',
        getUrl: (isbn, title) => `https://books.google.co.in/books?isbn=${isbn}`,
        description: 'Preview & purchase options'
    },
    {
        name: 'AbeBooks',
        icon: <Tag className="w-5 h-5" />,
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60',
        getUrl: (isbn, title) => `https://www.abebooks.com/servlet/SearchResults?isbn=${isbn}`,
        description: 'Rare & used books worldwide'
    }
];

interface BuyLinksProps {
    isbn?: string;
    title: string;
    author?: string;
}

export default function BuyLinks({ isbn, title, author }: BuyLinksProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-success-500/20 border border-success-500/30">
                        <ShoppingCart className="w-5 h-5 text-success-400" />
                    </span>
                    <div>
                        <h2 className="text-lg font-bold text-white">Where to Buy</h2>
                        <p className="text-xs text-slate-400">Click to check current prices</p>
                    </div>
                </div>
            </div>

            {/* Retailer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RETAILERS.map((retailer) => (
                    <a
                        key={retailer.name}
                        href={retailer.getUrl(isbn || '', title, author)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02] ${retailer.bgColor}`}
                    >
                        <div className={`p-2 rounded-lg bg-[#0a0e27]/50 ${retailer.color}`}>
                            {retailer.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white">{retailer.name}</h3>
                            <p className="text-xs text-slate-400 line-clamp-1">{retailer.description}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                    </a>
                ))}
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-3 p-4 bg-[#0a0e27]/50 rounded-xl border border-[#1e2749]">
                <span className="text-xl">💡</span>
                <div>
                    <p className="text-sm text-slate-300">
                        Prices vary by seller and availability. Click any retailer to see current prices and deals.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Tip: Used books on AbeBooks are often the cheapest option!
                    </p>
                </div>
            </div>
        </div>
    );
}
