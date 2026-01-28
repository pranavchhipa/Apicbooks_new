
import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
    location: string | null;
    current_streak: number;
    longest_streak: number;
    reading_goal: number;
    favorite_genres?: string[];
    last_visited_at: string | null;
    preferences: {
        region: string;
        currency: string;
        affiliate_tag?: string;
    };
    xp?: number;
    created_at?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const supabase = createClient();

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            ...cleanUpdates,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
