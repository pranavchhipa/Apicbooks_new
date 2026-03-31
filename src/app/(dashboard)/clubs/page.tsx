'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import {
    Users, Plus, Search, BookOpen, Globe, Lock, X,
    Loader2, Crown, Sparkles, ArrowRight, Hash, Filter
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface BookClub {
    id: string;
    name: string;
    description: string;
    genre: string;
    cover_image: string | null;
    member_count: number;
    current_book_title: string | null;
    current_book_cover: string | null;
    is_public: boolean;
    created_at: string;
    created_by: string;
}

type Genre = 'All' | 'Fiction' | 'Non-Fiction' | 'Sci-Fi' | 'Romance' | 'Mystery' | 'Self-Help';

// ---------------------------------------------------------------------------
// Placeholder data used when the database is empty
// ---------------------------------------------------------------------------
const PLACEHOLDER_CLUBS: BookClub[] = [
    {
        id: 'placeholder-1',
        name: 'The Midnight Library',
        description: 'A cozy club exploring literary fiction and magical realism. We read one book a month and host lively discussions every Sunday evening.',
        genre: 'Fiction',
        cover_image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
        member_count: 142,
        current_book_title: 'Tomorrow, and Tomorrow, and Tomorrow',
        current_book_cover: 'https://covers.openlibrary.org/b/isbn/9780593321201-M.jpg',
        is_public: true,
        created_at: new Date().toISOString(),
        created_by: 'system',
    },
    {
        id: 'placeholder-2',
        name: 'Nebula Readers',
        description: 'For lovers of science fiction and speculative worlds. Hard sci-fi, space opera, cyberpunk -- we devour it all.',
        genre: 'Sci-Fi',
        cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
        member_count: 89,
        current_book_title: 'Project Hail Mary',
        current_book_cover: 'https://covers.openlibrary.org/b/isbn/9780593135204-M.jpg',
        is_public: true,
        created_at: new Date().toISOString(),
        created_by: 'system',
    },
    {
        id: 'placeholder-3',
        name: 'Between the Pages',
        description: 'Romance readers unite! From slow-burn contemporary to sweeping historical romance, every love story finds a home here.',
        genre: 'Romance',
        cover_image: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=600&q=80',
        member_count: 213,
        current_book_title: 'Beach Read',
        current_book_cover: 'https://covers.openlibrary.org/b/isbn/9780593336472-M.jpg',
        is_public: true,
        created_at: new Date().toISOString(),
        created_by: 'system',
    },
    {
        id: 'placeholder-4',
        name: 'Whodunit Society',
        description: 'Murder mysteries, psychological thrillers, and detective fiction. Can you solve it before the last chapter?',
        genre: 'Mystery',
        cover_image: 'https://images.unsplash.com/photo-1587876931567-564ce588bfbd?w=600&q=80',
        member_count: 167,
        current_book_title: 'The Maid',
        current_book_cover: 'https://covers.openlibrary.org/b/isbn/9780593356159-M.jpg',
        is_public: true,
        created_at: new Date().toISOString(),
        created_by: 'system',
    },
    {
        id: 'placeholder-5',
        name: 'Growth Mindset Circle',
        description: 'Level up your life through books. We explore productivity, psychology, leadership, and personal development together.',
        genre: 'Self-Help',
        cover_image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80',
        member_count: 94,
        current_book_title: 'Atomic Habits',
        current_book_cover: 'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg',
        is_public: true,
        created_at: new Date().toISOString(),
        created_by: 'system',
    },
    {
        id: 'placeholder-6',
        name: 'Non-Fiction Nerds',
        description: 'History, science, politics, memoir -- if it happened for real, we want to read about it. Deep dives into the world as it is.',
        genre: 'Non-Fiction',
        cover_image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
        member_count: 78,
        current_book_title: 'Sapiens',
        current_book_cover: 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg',
        is_public: true,
        created_at: new Date().toISOString(),
        created_by: 'system',
    },
];

// ---------------------------------------------------------------------------
// Genre badge colours (dark theme)
// ---------------------------------------------------------------------------
const GENRE_COLORS: Record<string, string> = {
    Fiction: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Non-Fiction': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'Sci-Fi': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    Romance: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Mystery: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'Self-Help': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const GENRES: Genre[] = ['All', 'Fiction', 'Non-Fiction', 'Sci-Fi', 'Romance', 'Mystery', 'Self-Help'];

// ---------------------------------------------------------------------------
// CreateClubModal
// ---------------------------------------------------------------------------
function CreateClubModal({ isOpen, onClose, onCreated }: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState<string>('Fiction');
    const [isPublic, setIsPublic] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('You must be signed in to create a club.');
                return;
            }

            const { error: insertError } = await supabase.from('book_clubs').insert({
                name: name.trim(),
                description: description.trim(),
                genre,
                is_public: isPublic,
                created_by: user.id,
                member_count: 1,
            });

            if (insertError) throw insertError;

            onCreated();
            onClose();
            setName('');
            setDescription('');
            setGenre('Fiction');
            setIsPublic(true);
        } catch (err: any) {
            setError(err.message || 'Failed to create club.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-white/[0.06] animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.03]">
                    <h2 className="text-xl font-display font-bold text-white">Start a New Club</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-white/40 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-sm border border-rose-500/20">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-white mb-1.5">Club Name *</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Midnight Library" className="input-field" maxLength={60} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-white mb-1.5">Description *</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell readers what your club is about..." rows={3} className="input-field resize-none" maxLength={300} />
                        <p className="text-xs text-white/30 mt-1 text-right">{description.length}/300</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-white mb-1.5">Genre</label>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.filter(g => g !== 'All').map((g) => (
                                <button key={g} type="button" onClick={() => setGenre(g)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${genre === g
                                        ? 'bg-amber-500 text-black border-amber-500'
                                        : 'bg-white/[0.03] text-white/60 border-white/[0.06] hover:border-white/[0.12] hover:text-white'
                                    }`}>{g}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-white mb-2">Visibility</label>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsPublic(true)}
                                className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${isPublic
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:border-white/[0.12]'
                                }`}><Globe className="w-4 h-4" />Public</button>
                            <button type="button" onClick={() => setIsPublic(false)}
                                className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${!isPublic
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:border-white/[0.12]'
                                }`}><Lock className="w-4 h-4" />Private</button>
                        </div>
                    </div>
                    <button type="submit" disabled={saving}
                        className="w-full px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {saving ? 'Creating...' : 'Create Club'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// FeaturedClubCard
// ---------------------------------------------------------------------------
function FeaturedClubCard({ club }: { club: BookClub }) {
    return (
        <Link href={`/clubs/${club.id}`}
            className="group relative rounded-2xl overflow-hidden h-72 md:h-80 flex flex-col justify-end transition-all hover:-translate-y-0.5 border border-white/[0.06] hover:border-white/[0.12]">
            <div className="absolute inset-0">
                {club.cover_image ? (
                    <Image src={club.cover_image} alt={club.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-surface to-surface-light" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold border border-white/[0.06]">
                    <Crown className="w-3 h-3 text-amber-400" />Featured
                </span>
                {!club.is_public && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-medium border border-white/[0.06]">
                        <Lock className="w-3 h-3" />
                    </span>
                )}
            </div>
            <div className="relative z-10 p-5 md:p-6 space-y-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${GENRE_COLORS[club.genre] || 'bg-white/10 text-white/60 border-white/[0.06]'} border`}>{club.genre}</span>
                <h3 className="text-xl md:text-2xl font-display font-bold text-white leading-tight">{club.name}</h3>
                <p className="text-white/60 text-sm line-clamp-2 max-w-md">{club.description}</p>
                <div className="flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1.5 text-white/60 text-sm"><Users className="w-3.5 h-3.5" />{club.member_count.toLocaleString()} members</span>
                    {club.current_book_title && (
                        <span className="flex items-center gap-1.5 text-white/60 text-sm"><BookOpen className="w-3.5 h-3.5" />Reading: <em className="text-white font-medium">{club.current_book_title}</em></span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ---------------------------------------------------------------------------
// ClubCard
// ---------------------------------------------------------------------------
function ClubCard({ club }: { club: BookClub }) {
    const genreStyle = GENRE_COLORS[club.genre] || 'bg-white/10 text-white/60 border-white/[0.06]';
    return (
        <Link href={`/clubs/${club.id}`}
            className="group bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all flex flex-col h-full">
            <div className="relative h-36 -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden">
                {club.cover_image ? (
                    <Image src={club.cover_image} alt={club.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-surface to-surface-light" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                {club.current_book_cover && (
                    <div className="absolute -bottom-5 right-4 w-14 h-20 rounded-lg overflow-hidden shadow-book border-2 border-surface">
                        <Image src={club.current_book_cover} alt={club.current_book_title || 'Current book'} fill className="object-cover" />
                    </div>
                )}
            </div>
            <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${genreStyle}`}>{club.genre}</span>
                    {!club.is_public && <Lock className="w-3 h-3 text-white/30" />}
                </div>
                <h3 className="text-base font-display font-bold text-white group-hover:text-amber-400 transition-colors leading-snug mb-1">{club.name}</h3>
                <p className="text-white/40 text-sm line-clamp-2 mb-3 flex-1">{club.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <span className="flex items-center gap-1.5 text-white/40 text-xs font-medium"><Users className="w-3.5 h-3.5" />{club.member_count.toLocaleString()}</span>
                    {club.current_book_title && (
                        <span className="flex items-center gap-1 text-white/30 text-xs truncate max-w-[55%]"><BookOpen className="w-3 h-3 shrink-0" /><span className="truncate">{club.current_book_title}</span></span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function ClubsPage() {
    const [clubs, setClubs] = useState<BookClub[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeGenre, setActiveGenre] = useState<Genre>('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [usingPlaceholders, setUsingPlaceholders] = useState(false);

    const supabase = createClient();

    const fetchClubs = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('book_clubs')
                .select('*')
                .order('member_count', { ascending: false });
            if (error) throw error;
            if (data && data.length > 0) {
                setClubs(data);
                setUsingPlaceholders(false);
            } else {
                setClubs(PLACEHOLDER_CLUBS);
                setUsingPlaceholders(true);
            }
        } catch (err) {
            console.error('Failed to fetch clubs:', err);
            setClubs(PLACEHOLDER_CLUBS);
            setUsingPlaceholders(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchClubs(); }, [fetchClubs]);

    const filteredClubs = clubs.filter((club) => {
        const matchesGenre = activeGenre === 'All' || club.genre === activeGenre;
        const matchesSearch = !searchQuery.trim() || club.name.toLowerCase().includes(searchQuery.toLowerCase()) || club.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGenre && matchesSearch;
    });

    const featuredClubs = filteredClubs.slice(0, 2);
    const regularClubs = filteredClubs.slice(2);

    const FeaturedSkeleton = () => (<div className="rounded-2xl h-72 md:h-80 bg-white/[0.06] animate-pulse" />);
    const CardSkeleton = () => (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 animate-pulse">
            <div className="h-36 -mx-6 -mt-6 mb-4 rounded-t-2xl bg-white/[0.06]" />
            <div className="h-3 bg-white/[0.06] rounded w-16 mb-3" />
            <div className="h-5 bg-white/[0.06] rounded w-3/4 mb-2" />
            <div className="h-3 bg-white/[0.03] rounded w-full mb-1" />
            <div className="h-3 bg-white/[0.03] rounded w-2/3 mb-4" />
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <div className="h-3 bg-white/[0.06] rounded w-16" />
                <div className="h-3 bg-white/[0.06] rounded w-24" />
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-1">Book Clubs</h1>
                    <p className="text-white/40 text-base">Find your reading tribe or start your own adventure</p>
                </div>
                <button onClick={() => setShowCreateModal(true)}
                    className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 text-sm w-fit">
                    <Plus className="w-4 h-4" />Start a Club
                </button>
            </div>

            <div className="space-y-4">
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30" />
                    <input type="text" placeholder="Search clubs by name or topic..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-11" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <Filter className="w-4 h-4 text-white/30 shrink-0 mr-1" />
                    {GENRES.map((genre) => (
                        <button key={genre} onClick={() => setActiveGenre(genre)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${activeGenre === genre
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'text-white/40 border-white/[0.06] hover:text-white hover:border-white/[0.12]'
                            }`}>{genre}</button>
                    ))}
                </div>
            </div>

            {usingPlaceholders && !loading && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-white/60 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                        These are sample clubs to inspire you.{' '}
                        <button onClick={() => setShowCreateModal(true)} className="text-amber-400 font-semibold underline underline-offset-2 hover:text-amber-300">
                            Create the first real club
                        </button>{' '}
                        and bring your community to life!
                    </span>
                </div>
            )}

            {!searchQuery.trim() && activeGenre === 'All' && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <h2 className="text-lg font-display font-bold text-white">Featured Clubs</h2>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FeaturedSkeleton /><FeaturedSkeleton /></div>
                    ) : featuredClubs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {featuredClubs.map((club) => (<FeaturedClubCard key={club.id} club={club} />))}
                        </div>
                    ) : null}
                </section>
            )}

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        <Hash className="w-4 h-4 text-white/30" />
                        {activeGenre === 'All' ? 'All Clubs' : activeGenre}
                        <span className="text-sm font-normal text-white/30 ml-1">
                            ({(activeGenre === 'All' && !searchQuery.trim() ? regularClubs : filteredClubs).length})
                        </span>
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                ) : (activeGenre === 'All' && !searchQuery.trim() ? regularClubs : filteredClubs).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(activeGenre === 'All' && !searchQuery.trim() ? regularClubs : filteredClubs).map((club, i) => (
                            <div key={club.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                                <ClubCard club={club} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5 rounded-full mb-4">
                            <Users className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-white mb-2">No clubs found</h3>
                        <p className="text-white/40 max-w-sm mb-6 text-sm">
                            {searchQuery.trim()
                                ? `No clubs match "${searchQuery}". Try a different search or start your own!`
                                : `There are no ${activeGenre} clubs yet. Be the first to create one!`
                            }
                        </p>
                        <button onClick={() => setShowCreateModal(true)}
                            className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 text-sm">
                            <Plus className="w-4 h-4" />Start a Club
                        </button>
                    </div>
                )}
            </section>

            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/50 via-surface to-surface-light p-8 md:p-10 text-white border border-amber-500/10">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-lg" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-violet-500/5 rounded-full blur-2xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 space-y-3">
                        <h3 className="text-2xl font-display font-bold">Ready to lead a reading adventure?</h3>
                        <p className="text-white/40 max-w-md text-sm leading-relaxed">
                            Create a club, pick your first book, and invite fellow readers. Build a community around the stories you love.
                        </p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 shrink-0">
                        Start Your Club<ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </section>

            <CreateClubModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={fetchClubs} />
        </div>
    );
}
