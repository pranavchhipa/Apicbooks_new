import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/landing/Hero';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import ValueProps from '@/components/landing/ValueProps';
import { CTA, Footer } from '@/components/landing/FooterCTA';
import { createClient } from '@/lib/supabase/server';

async function LandingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary-500/30 selection:text-white">
            <Navbar user={user} />

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
