'use client';

import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/landing/Hero';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import ValueProps from '@/components/landing/ValueProps';
import { CTA, Footer } from '@/components/landing/FooterCTA';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

function LandingPage() {
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.reload();
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary-500/30 selection:text-white">
            <Navbar user={user} onLogout={handleLogout} />

            <Hero />
            <FeaturesGrid />
            <ValueProps />
            <CTA user={user} />
            <Footer />
        </main>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
            <LandingPage />
        </Suspense>
    );
}
