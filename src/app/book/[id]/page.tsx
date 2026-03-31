import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Calendar, FileText, Tag, Clock, Star, Users, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import BookDetailClient from './BookDetailClient';

// ============================================
// TYPES
// ============================================

interface GoogleVolumeInfo {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
        small?: string;
        medium?: string;
        large?: string;
        extraLarge?: string;
    };
    industryIdentifiers?: {
        type: string;
        identifier: string;
    }[];
    publisher?: string;
    language?: string;
    previewLink?: string;
    infoLink?: string;
}

interface GoogleVolume {
    id: string;
    volumeInfo: GoogleVolumeInfo;
}

export interface BookData {
    id: string;
    title: string;
    authors: string[];
    description: string | null;
    coverUrl: string | null;
    pageCount: number | null;
    publishedDate: string | null;
    categories: string[];
    rating: number | null;
    ratingsCount: number | null;
    isbn: string | null;
    publisher: string | null;
    language: string | null;
    previewLink: string | null;
}

// ============================================
// DATA FETCHING
// ============================================

async function getBookData(id: string): Promise<BookData | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes/${id}${apiKey ? `?key=${apiKey}` : ''}`;

    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });

        if (!res.ok) return null;

        const data: GoogleVolume = await res.json();
        const v = data.volumeInfo;

        // Get the best available cover image
        const coverUrl = v.imageLinks?.large
            || v.imageLinks?.medium
            || v.imageLinks?.small
            || v.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=3')
            || v.imageLinks?.thumbnail
            || null;

        // Get ISBN
        const isbn13 = v.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier;
        const isbn10 = v.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier;

        return {
            id: data.id,
            title: v.title,
            authors: v.authors || [],
            description: v.description || null,
            coverUrl,
            pageCount: v.pageCount || null,
            publishedDate: v.publishedDate || null,
            categories: v.categories || [],
            rating: v.averageRating || null,
            ratingsCount: v.ratingsCount || null,
            isbn: isbn13 || isbn10 || null,
            publisher: v.publisher || null,
            language: v.language || null,
            previewLink: v.previewLink || null,
        };
    } catch {
        return null;
    }
}

async function getRelatedBooks(categories: string[], excludeId: string): Promise<BookData[]> {
    if (!categories.length) return [];

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
    const query = `subject:${encodeURIComponent(categories[0])}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=6&orderBy=relevance${apiKey ? `&key=${apiKey}` : ''}`;

    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return [];

        const data = await res.json();
        if (!data.items) return [];

        return data.items
            .filter((item: GoogleVolume) => item.id !== excludeId)
            .slice(0, 4)
            .map((item: GoogleVolume) => {
                const v = item.volumeInfo;
                return {
                    id: item.id,
                    title: v.title,
                    authors: v.authors || [],
                    description: null,
                    coverUrl: v.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=2') || null,
                    pageCount: v.pageCount || null,
                    publishedDate: v.publishedDate || null,
                    categories: v.categories || [],
                    rating: v.averageRating || null,
                    ratingsCount: v.ratingsCount || null,
                    isbn: null,
                    publisher: null,
                    language: null,
                    previewLink: null,
                };
            });
    } catch {
        return [];
    }
}

interface CommunityReview {
    id: string;
    user_id: string;
    rating: number;
    review: string | null;
    updated_at: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

async function getBookReviews(googleBookId: string): Promise<{ reviews: CommunityReview[]; averageRating: number; internalBookId: string | null }> {
    try {
        const supabase = await createClient();

        // Resolve Google ID to internal UUID
        const { data: bookRecord } = await supabase
            .from('books')
            .select('id')
            .eq('google_id', googleBookId)
            .single();

        if (!bookRecord) return { reviews: [], averageRating: 0, internalBookId: null };

        const { data: reviews } = await supabase
            .from('user_library')
            .select(`
                id,
                user_id,
                rating,
                review,
                updated_at,
                profiles:user_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('book_id', bookRecord.id)
            .eq('is_review_public', true)
            .not('rating', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(10);

        const reviewsData = (reviews || []) as unknown as CommunityReview[];
        const avg = reviewsData.length > 0
            ? reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length
            : 0;

        return { reviews: reviewsData, averageRating: avg, internalBookId: bookRecord.id };
    } catch {
        return { reviews: [], averageRating: 0, internalBookId: null };
    }
}

async function getClubsReadingBook(googleBookId: string): Promise<{ id: string; name: string; member_count: number }[]> {
    try {
        const supabase = await createClient();

        const { data: bookRecord } = await supabase
            .from('books')
            .select('id')
            .eq('google_id', googleBookId)
            .single();

        if (!bookRecord) return [];

        const { data: clubs } = await supabase
            .from('club_books')
            .select(`
                clubs (
                    id,
                    name,
                    member_count
                )
            `)
            .eq('book_id', bookRecord.id)
            .limit(5);

        if (!clubs) return [];

        return clubs
            .map((c: any) => c.clubs)
            .filter(Boolean)
            .map((club: any) => ({
                id: club.id,
                name: club.name,
                member_count: club.member_count || 0,
            }));
    } catch {
        return [];
    }
}

// ============================================
// LOADING / ERROR STATES
// ============================================

function BookSkeleton() {
    return (
        <div className="min-h-screen bg-midnight">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="animate-pulse">
                    <div className="h-5 w-20 bg-white/[0.08] rounded mb-10" />
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="md:col-span-1">
                            <div className="aspect-[2/3] rounded-2xl bg-white/[0.04]" />
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <div className="h-10 w-3/4 bg-white/[0.04] rounded" />
                            <div className="h-6 w-1/2 bg-white/[0.04] rounded" />
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-white/[0.04] rounded" />
                                <div className="h-4 w-full bg-white/[0.04] rounded" />
                                <div className="h-4 w-2/3 bg-white/[0.04] rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// PAGE COMPONENT (Server)
// ============================================

interface PageProps {
    params: { id: string };
}

export default async function BookDetailPage({ params }: PageProps) {
    const { id } = await params;

    const [book, { reviews, averageRating, internalBookId }, clubs] = await Promise.all([
        getBookData(id),
        getBookReviews(id),
        getClubsReadingBook(id),
    ]);

    if (!book) {
        return (
            <div className="min-h-screen bg-midnight flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-white/[0.06]">
                        <BookOpen className="w-10 h-10 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">
                        Book Not Found
                    </h2>
                    <p className="text-white/50 mb-6 font-serif">
                        We couldn&apos;t find the book you&apos;re looking for. It may have been removed or the link may be incorrect.
                    </p>
                    <Link href="/discover" className="btn-primary inline-flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Browse Books
                    </Link>
                </div>
            </div>
        );
    }

    const relatedBooks = await getRelatedBooks(book.categories, id);
    const readingTime = book.pageCount ? Math.round(book.pageCount / 40) : null;

    // Strip HTML from description for plain text display
    const plainDescription = book.description
        ? book.description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ')
        : null;

    return (
        <div className="min-h-screen bg-midnight">
            {/* Hero Header with book cover background blur */}
            <div className="relative bg-midnight overflow-hidden">
                {/* Blurred cover background */}
                {book.coverUrl && (
                    <div className="absolute inset-0">
                        <Image
                            src={book.coverUrl}
                            alt=""
                            fill
                            className="object-cover opacity-20 blur-2xl scale-110"
                            priority={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-midnight/80 via-midnight/90 to-midnight" />
                    </div>
                )}

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pb-24">
                    {/* Back Button */}
                    <Link
                        href="/discover"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-amber-400 transition-colors mb-8 text-sm font-medium group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Discover
                    </Link>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start">
                        {/* Book Cover */}
                        <div className="md:col-span-1 flex justify-center md:justify-start">
                            <div className="relative w-56 sm:w-64 md:w-full max-w-[280px]">
                                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
                                    {book.coverUrl ? (
                                        <Image
                                            src={book.coverUrl}
                                            alt={book.title}
                                            fill
                                            sizes="(max-width: 768px) 250px, 280px"
                                            className="object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 text-center">
                                            <BookOpen className="w-16 h-16 text-white/20 mb-3" />
                                            <span className="text-sm font-serif text-white/30 line-clamp-3">
                                                {book.title}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Book Info */}
                        <div className="md:col-span-2">
                            {/* Categories */}
                            {book.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {book.categories.map((cat, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-full bg-white/[0.06] text-white/60 text-xs font-medium border border-white/[0.06]"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Title */}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-3">
                                {book.title}
                            </h1>

                            {/* Author */}
                            <p className="text-lg sm:text-xl text-white/60 font-serif mb-6">
                                by {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
                            </p>

                            {/* Rating & Meta */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                                {/* Rating */}
                                {(book.rating || averageRating > 0) && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < Math.round(book.rating || averageRating)
                                                            ? 'text-amber-400 fill-amber-400'
                                                            : 'text-white/20'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-white/80 font-medium">
                                            {(book.rating || averageRating).toFixed(1)}
                                        </span>
                                        {(book.ratingsCount || reviews.length > 0) && (
                                            <span className="text-white/40">
                                                ({book.ratingsCount || reviews.length} {(book.ratingsCount || reviews.length) === 1 ? 'rating' : 'ratings'})
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Page count */}
                                {book.pageCount && (
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <FileText className="w-4 h-4" />
                                        <span>{book.pageCount} pages</span>
                                    </div>
                                )}

                                {/* Published date */}
                                {book.publishedDate && (
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Calendar className="w-4 h-4" />
                                        <span>{book.publishedDate}</span>
                                    </div>
                                )}

                                {/* Reading time */}
                                {readingTime && (
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Clock className="w-4 h-4" />
                                        <span>~{readingTime}h read</span>
                                    </div>
                                )}
                            </div>

                            {/* Publisher & ISBN */}
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-white/30">
                                {book.publisher && (
                                    <span>Published by {book.publisher}</span>
                                )}
                                {book.isbn && (
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        ISBN: {book.isbn}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Client-side interactive section (shelf actions, progress, review) */}
                        <Suspense fallback={
                            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="h-12 flex-1 bg-white/[0.04] rounded-xl" />
                                    <div className="h-12 flex-1 bg-white/[0.04] rounded-xl" />
                                    <div className="h-12 flex-1 bg-white/[0.04] rounded-xl" />
                                </div>
                            </div>
                        }>
                            <BookDetailClient
                                bookId={id}
                                bookTitle={book.title}
                                bookCoverUrl={book.coverUrl}
                                pageCount={book.pageCount}
                                internalBookId={internalBookId}
                            />
                        </Suspense>

                        {/* Description */}
                        {plainDescription && (
                            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 sm:p-8 shadow-glass">
                                <h2 className="text-xl font-display font-bold text-white mb-4">
                                    About This Book
                                </h2>
                                <div className="text-white/60 font-serif leading-relaxed whitespace-pre-line">
                                    {plainDescription}
                                </div>
                            </div>
                        )}

                        {/* Community Reviews */}
                        {reviews.length > 0 && (
                            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 sm:p-8 shadow-glass">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-display font-bold text-white">
                                        Community Reviews
                                    </h2>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-white/[0.06]">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <span className="text-sm font-semibold text-white">
                                            {averageRating.toFixed(1)}
                                        </span>
                                        <span className="text-xs text-white/40">
                                            ({reviews.length})
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {reviews.slice(0, 5).map((review) => (
                                        <div
                                            key={review.id}
                                            className="pb-5 border-b border-white/[0.06] last:border-0 last:pb-0"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Avatar */}
                                                <div className="flex-shrink-0">
                                                    {review.profiles?.avatar_url ? (
                                                        <Image
                                                            src={review.profiles.avatar_url}
                                                            alt={review.profiles.full_name || 'Reader'}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full object-cover ring-2 ring-white/[0.06]"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center ring-2 ring-white/[0.06]">
                                                            <span className="text-sm font-bold text-amber-400">
                                                                {(review.profiles?.full_name || 'A')[0].toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-white text-sm">
                                                            {review.profiles?.full_name || 'Anonymous Reader'}
                                                        </span>
                                                        <span className="text-xs text-white/30">
                                                            {new Date(review.updated_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>

                                                    {/* Stars */}
                                                    <div className="flex items-center gap-0.5 mb-2">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-3.5 h-3.5 ${
                                                                    i < Math.round(review.rating)
                                                                        ? 'text-amber-400 fill-amber-400'
                                                                        : 'text-white/20'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>

                                                    {review.review && (
                                                        <p className="text-white/50 text-sm font-serif leading-relaxed">
                                                            &ldquo;{review.review}&rdquo;
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Clubs Reading This */}
                        {clubs.length > 0 && (
                            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 shadow-glass">
                                <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-amber-400" />
                                    Clubs Reading This
                                </h3>
                                <div className="space-y-3">
                                    {clubs.map((club) => (
                                        <Link
                                            key={club.id}
                                            href={`/clubs/${club.id}`}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1] transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="w-5 h-5 text-amber-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                                                    {club.name}
                                                </div>
                                                <div className="text-xs text-white/40">
                                                    {club.member_count} {club.member_count === 1 ? 'member' : 'members'}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Books */}
                        {relatedBooks.length > 0 && (
                            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 shadow-glass">
                                <h3 className="text-lg font-display font-bold text-white mb-4">
                                    You Might Also Like
                                </h3>
                                <div className="space-y-4">
                                    {relatedBooks.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/book/${related.id}`}
                                            className="flex gap-3 group"
                                        >
                                            <div className="relative w-12 h-[72px] rounded-lg overflow-hidden flex-shrink-0 shadow-book ring-1 ring-white/[0.06]">
                                                {related.coverUrl ? (
                                                    <Image
                                                        src={related.coverUrl}
                                                        alt={related.title}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                                                        <BookOpen className="w-5 h-5 text-white/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 py-0.5">
                                                <div className="text-sm font-semibold text-white/80 line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
                                                    {related.title}
                                                </div>
                                                <div className="text-xs text-white/40 mt-0.5 truncate">
                                                    {related.authors.join(', ') || 'Unknown'}
                                                </div>
                                                {related.rating && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                        <span className="text-xs text-white/50">{related.rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Info Card */}
                        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
                            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">
                                Book Details
                            </h3>
                            <dl className="space-y-3 text-sm">
                                {book.publisher && (
                                    <div className="flex justify-between">
                                        <dt className="text-white/40">Publisher</dt>
                                        <dd className="text-white/80 font-medium text-right">{book.publisher}</dd>
                                    </div>
                                )}
                                {book.publishedDate && (
                                    <div className="flex justify-between">
                                        <dt className="text-white/40">Published</dt>
                                        <dd className="text-white/80 font-medium">{book.publishedDate}</dd>
                                    </div>
                                )}
                                {book.pageCount && (
                                    <div className="flex justify-between">
                                        <dt className="text-white/40">Pages</dt>
                                        <dd className="text-white/80 font-medium">{book.pageCount}</dd>
                                    </div>
                                )}
                                {book.isbn && (
                                    <div className="flex justify-between">
                                        <dt className="text-white/40">ISBN</dt>
                                        <dd className="text-white/80 font-medium font-mono text-xs">{book.isbn}</dd>
                                    </div>
                                )}
                                {book.language && (
                                    <div className="flex justify-between">
                                        <dt className="text-white/40">Language</dt>
                                        <dd className="text-white/80 font-medium uppercase">{book.language}</dd>
                                    </div>
                                )}
                            </dl>

                            {book.previewLink && (
                                <a
                                    href={book.previewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 w-full btn-secondary text-sm py-2.5 flex items-center justify-center gap-2"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Preview on Google Books
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
