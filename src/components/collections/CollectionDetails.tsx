import { motion } from 'framer-motion';
import { CollectionItem } from '@/lib/api/collections';
import Link from 'next/link';
import { Trash2, ArrowLeft } from 'lucide-react';

interface CollectionDetailProps {
    items: CollectionItem[];
    onBack: () => void;
    onRemove: (bookId: string) => void;
    collectionName: string;
}

export default function CollectionDetails({ items, onBack, onRemove, collectionName }: CollectionDetailProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-2xl font-display font-bold">{collectionName}</h2>
                    <p className="text-slate-400">{items.length} books</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    This collection is empty. Add books from the Discover page!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 bg-card border border-card-border rounded-xl group hover:border-primary-500/30 transition-all">
                            <img src={item.book.cover_url} alt={item.book.title} className="w-16 h-24 object-cover rounded shadow-sm" />
                            <div className="flex-1 min-w-0 py-1">
                                <Link href={`/book/${item.book.id}`} className="font-bold text-foreground truncate block hover:text-primary-500 transition-colors">
                                    {item.book.title}
                                </Link>
                                <p className="text-sm text-slate-500 truncate mb-auto">
                                    {item.book.authors[0]}
                                </p>
                                <button
                                    onClick={() => onRemove(item.book.id)}
                                    className="mt-4 text-xs text-rose-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                                >
                                    <Trash2 className="w-3 h-3" /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
