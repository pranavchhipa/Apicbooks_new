import { useState, useEffect } from 'react';
import { X, Check, Loader2, Plus, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCollections, addBookToCollection, createCollection, type Collection } from '@/lib/api/collections';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AddToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookId: string; // The book we want to add
    googleId?: string; // If it's a new book from search
}

export default function AddToCollectionModal({ isOpen, onClose, bookId, googleId }: AddToCollectionModalProps) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingTo, setAddingTo] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [showCreateInput, setShowCreateInput] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) fetchCollections();
    }, [isOpen]);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const data = await getCollections(user.id);
            setCollections(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (collectionId: string) => {
        setAddingTo(collectionId);
        try {
            await addBookToCollection(collectionId, bookId);
            toast.success("Added to collection");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to add book (it might already be in this list)");
        } finally {
            setAddingTo(null);
        }
    };

    const handleCreate = async () => {
        if (!newCollectionName.trim()) return;
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const newCol = await createCollection(user.id, newCollectionName.trim());
            if (newCol) {
                await handleAdd(newCol.id);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create collection");
        }
    };

    if (!isOpen || !mounted) return null;

    const { createPortal } = require('react-dom');

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-[#1e1b2e] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Library className="w-5 h-5 text-primary-500" />
                            Add to Shelf
                        </h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
                        ) : collections.length === 0 && !showCreateInput ? (
                            <div className="text-center py-6 text-slate-500">
                                <p>No shelves yet.</p>
                                <button onClick={() => setShowCreateInput(true)} className="text-primary-500 font-bold mt-2 hover:underline">Create one</button>
                            </div>
                        ) : (
                            collections.map(col => (
                                <button
                                    key={col.id}
                                    onClick={() => handleAdd(col.id)}
                                    disabled={addingTo !== null}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            {col.preview_books?.[0] ? (
                                                <img src={col.preview_books[0].cover_url} className="w-full h-full object-cover rounded-lg" />
                                            ) : <Library className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-sm">{col.name}</p>
                                            <p className="text-xs text-slate-400">{col.item_count || 0} items</p>
                                        </div>
                                    </div>
                                    {addingTo === col.id && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
                                    <Plus className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))
                        )}

                        {/* Create New Input */}
                        {showCreateInput ? (
                            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-in slide-in-from-top-2">
                                <input
                                    autoFocus
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-400 mb-2"
                                    placeholder="Shelf Name..."
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setShowCreateInput(false)} className="text-xs text-slate-500 px-2 py-1">Cancel</button>
                                    <button onClick={handleCreate} disabled={!newCollectionName.trim()} className="text-xs bg-primary-600 text-white px-3 py-1 rounded-lg font-bold disabled:opacity-50">Create</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowCreateInput(true)}
                                className="w-full flex items-center gap-3 p-3 text-primary-500 font-bold text-sm hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl transition-colors mt-2"
                            >
                                <div className="w-10 h-10 rounded-lg border-2 border-dashed border-primary-200 dark:border-primary-800 flex items-center justify-center">
                                    <Plus className="w-5 h-5" />
                                </div>
                                Create New Shelf
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
