import { createClient } from '@/lib/supabase/client';
import { ensureBookExists } from './library';

export interface Collection {
    id: string;
    name: string;
    description?: string;
    cover_url?: string;
    created_at: string;
    item_count?: number;
    preview_books?: { cover_url: string }[];
}

export interface CollectionItem {
    id: string;
    collection_id: string;
    book_id: string;
    added_at: string;
    book: {
        id: string;
        title: string;
        authors: string[];
        cover_url: string;
    };
}

export async function getCollections(userId: string) {
    const supabase = createClient();

    // 1. Get collections
    const { data: collections, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. Enrich with item counts and previews
    // Note: In a real prod app with thousands of items, we'd use a view or RPC.
    // For now, we'll do individual fetches or a joined query if possible.
    // Supabase can do deep fetching, let's try to get items with limit.

    // Actually, let's just fetch all items (id, collection_id, book(cover_url)) for these collections lightly?
    // Or just a separate query per collection for the preview.

    const enriched = await Promise.all(collections.map(async (col) => {
        const { count } = await supabase
            .from('collection_items')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', col.id);

        const { data: preview } = await supabase
            .from('collection_items')
            .select('book:books(cover_url)')
            .eq('collection_id', col.id)
            .limit(3);

        const covers = preview?.map((p: any) => ({ cover_url: p.book?.cover_url })).filter(c => c.cover_url) || [];

        return {
            ...col,
            item_count: count || 0,
            preview_books: covers
        };
    }));

    return enriched as Collection[];
}

export async function createCollection(userId: string, name: string, description?: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('collections')
        .insert({
            user_id: userId,
            name,
            description
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteCollection(collectionId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

    if (error) throw error;
}



export async function addBookToCollection(collectionId: string, bookId: string) {
    const supabase = createClient();

    let targetBookId = bookId;

    // Check if bookId is a valid UUID (simple regex check)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId);

    if (!isUUID) {
        // Assume it's a Google ID and try to ensure it exists
        const resolvedId = await ensureBookExists(bookId);
        if (resolvedId) {
            targetBookId = resolvedId;
        } else {
            // It might be a Google ID that failed to fetch, or something else.
            // But if ensureBookExists failed, we can't really proceed if we strictly need a UUID.
            // However, it's possible the user passed a non-UUID that ISN'T a google ID? Unlikely in this app context.
            console.warn(`Could not resolve book ID ${bookId} to a UUID`);
            throw new Error("Invalid book ID");
        }
    } else {
        // It IS a UUID. But is it in our books table?
        // If we insert blindly and it's not in books table (foreign key), it will fail.
        // But if it is a UUID, it SHOULD be in our books table (unless it's a UUID from somewhere else?).
        // Let's assume valid UUIDs passed here are from our DB. 
        // If it fails FK, it throws, which is fine.
    }

    const { error } = await supabase
        .from('collection_items')
        .insert({
            collection_id: collectionId,
            book_id: targetBookId
        });

    if (error) throw error;
}

export async function removeBookFromCollection(collectionId: string, bookId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('book_id', bookId);

    if (error) throw error;
}

export async function getCollectionDetails(collectionId: string) {
    const supabase = createClient();

    // Get Collection Info
    const { data: collection, error: colError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

    if (colError) throw colError;

    // Get Items
    const { data: items, error: itemsError } = await supabase
        .from('collection_items')
        .select(`
            *,
            book:books (id, title, authors, cover_url, page_count)
        `)
        .eq('collection_id', collectionId)
        .order('added_at', { ascending: false });

    if (itemsError) throw itemsError;

    return {
        collection,
        items: items as CollectionItem[]
    };
}
