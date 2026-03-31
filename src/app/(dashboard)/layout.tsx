import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import DashboardClientLayout from './DashboardClientLayout';
import { redirect } from 'next/navigation';

// Mock user for dev bypass
const MOCK_USER = {
    id: 'dev-bypass-user',
    email: 'dev@apicbooks.com',
    user_metadata: { full_name: 'Dev User' },
};

const MOCK_PROFILE = {
    id: 'dev-bypass-user',
    full_name: 'Dev User',
    email: 'dev@apicbooks.com',
    avatar_url: null,
    bio: 'Testing the app',
    favorite_genres: ['Fiction', 'Sci-Fi'],
    reading_goal: 24,
    created_at: new Date().toISOString(),
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const bypassAuth = cookieStore.get('bypass-auth')?.value === 'true';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // TEMPORARY: Auth disabled for preview — re-enable when done
    // if (!user && !bypassAuth) {
    //     redirect('/auth/login');
    // }

    let profile = null;
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return (
        <DashboardClientLayout initialUser={user || MOCK_USER} initialProfile={profile || MOCK_PROFILE}>
            {children}
        </DashboardClientLayout>
    );
}
