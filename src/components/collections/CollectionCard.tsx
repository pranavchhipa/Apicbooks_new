import { motion } from 'framer-motion';
import { Collection } from '@/lib/api/collections';
import { BookOpen, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface CollectionCardProps {
    collection: Collection;
    onDelete: (id: string) => void;
    onClick?: () => void;
}

export default function CollectionCard({ collection, onDelete, onClick }: CollectionCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    // Get covers for preview (up to 3)
    const covers = collection.preview_books?.slice(0, 3) || [];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative cursor-pointer"
            onClick={onClick}
        >
            {/* Folder / Book Stack Visual */}
            <div className="relative aspect-[3/4] mb-4">
                {/* Back layers for stack effect */}
                <div className="absolute top-2 right-2 w-full h-full bg-slate-200 dark:bg-slate-700 rounded-2xl border border-slate-300 dark:border-slate-600 shadow-sm transform translate-x-1 -translate-y-1 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" />
                <div className="absolute top-1 right-1 w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm" />

                {/* Main Card */}
                <div className="relative w-full h-full bg-white dark:bg-[#1e1b2e] rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    {/* Cover Preview Grid */}
                    {covers.length > 0 ? (
                        <div className="grid grid-cols-2 grid-rows-2 w-full h-full p-2 gap-1 bg-slate-50 dark:bg-slate-900/50">
                            {/* If 1 book, full size */}
                            {covers.length === 1 && (
                                <img src={covers[0].cover_url} alt="" className="col-span-2 row-span-2 w-full h-full object-cover rounded-xl" />
                            )}
                            {/* If 2 books, split vert */}
                            {covers.length === 2 && (
                                <>
                                    <img src={covers[0].cover_url} alt="" className="col-span-1 row-span-2 w-full h-full object-cover rounded-l-xl" />
                                    <img src={covers[1].cover_url} alt="" className="col-span-1 row-span-2 w-full h-full object-cover rounded-r-xl" />
                                </>
                            )}
                            {/* If 3+ books, 1 big, 2 small */}
                            {covers.length >= 3 && (
                                <>
                                    <img src={covers[0].cover_url} alt="" className="col-span-2 row-span-1 w-full h-full object-cover rounded-t-xl" />
                                    <img src={covers[1].cover_url} alt="" className="col-span-1 row-span-1 w-full h-full object-cover rounded-bl-xl" />
                                    <img src={covers[2].cover_url} alt="" className="col-span-1 row-span-1 w-full h-full object-cover rounded-br-xl" />
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600">
                            <BookOpen className="w-12 h-12 mb-2" />
                            <span className="text-xs font-medium">Empty List</span>
                        </div>
                    )}

                    {/* Badge Count */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/10">
                        {collection.item_count} items
                    </div>
                </div>

                {/* Menu Button */}
                <div className="absolute top-3 right-3 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        className="p-1.5 rounded-full bg-white/80 dark:bg-black/60 text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(collection.id); setShowMenu(false); }}
                                className="w-full px-4 py-2 text-left text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Title & Desc */}
            <div className="px-1">
                <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary-500 transition-colors">
                    {collection.name}
                </h3>
                {collection.description && (
                    <p className="text-xs text-slate-500 truncate">{collection.description}</p>
                )}
            </div>
        </motion.div>
    );
}
