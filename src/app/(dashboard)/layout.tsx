import { createClient } from '@/lib/supabase/server';
import DashboardClientLayout from './DashboardClientLayout';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/api/user'; // Ensure this can run on server or use supabase direct query if needed. 
// Note: api/user.ts likely uses 'createClient' from  supabase/client or server depending on context. 
// If getUserProfile uses client-side auth, we should manually fetch profile here.

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // specific server-side fetch for profile to avoid 'getUserProfile' client dependency issues if any
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <DashboardClientLayout initialUser={user} initialProfile={profile}>
            {children}
        </DashboardClientLayout>
    );
}
