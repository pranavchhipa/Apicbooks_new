'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success('Welcome back!');
            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            toast.error(err.message || 'Failed to sign in with Google');
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-screen flex bg-midnight">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-sm">
                    {/* Back + Logo row */}
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm font-medium group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Home
                        </Link>
                        <Link href="/" className="font-display text-xl font-extrabold text-white tracking-tight">
                            ApicBooks
                        </Link>
                    </div>

                    {/* Heading */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
                            Welcome back, reader
                        </h1>
                        <p className="text-white/60 font-serif italic">
                            Pick up right where you left off.
                        </p>
                    </div>

                    {/* Google OAuth */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        type="button"
                        className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white/[0.03] backdrop-blur-xl text-white rounded-xl font-semibold border border-white/[0.1] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Sign in with Google
                    </button>

                    {/* Divider */}
                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/[0.06]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-midnight text-white/30 font-medium">
                                or sign in with email
                            </span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/25">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-white/60">
                                    Password
                                </label>
                                <Link
                                    href="/auth/reset-password"
                                    className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/25">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all text-sm"
                                    placeholder="Enter your password"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-white/25 hover:text-white/60 transition-colors focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-amber-500 text-midnight font-semibold py-2.5 rounded-full hover:bg-amber-400 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Signup Link */}
                    <p className="text-center text-white/40 text-sm mt-6">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/auth/signup"
                            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Decorative Panel (hidden on mobile/tablet) */}
            <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] bg-surface relative overflow-hidden items-center justify-center">
                {/* Background ambient glows */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-light to-surface" />
                    <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-amber-500/[0.06] blur-[100px]" />
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-violet-500/[0.06] blur-[100px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-500/[0.03] blur-[80px]" />
                </div>

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 px-10 xl:px-14 text-center">
                    <blockquote className="mb-10">
                        <div className="w-10 h-[2px] bg-amber-500/40 mx-auto mb-8" />
                        <p className="text-xl font-serif italic text-white/80 leading-relaxed mb-4">
                            &ldquo;A reader lives a thousand lives before he dies. The man who never reads lives only one.&rdquo;
                        </p>
                        <footer className="text-white/30 font-sans text-sm">
                            &mdash; George R.R. Martin
                        </footer>
                        <div className="w-10 h-[2px] bg-violet-500/40 mx-auto mt-8" />
                    </blockquote>

                    {/* Decorative book spines */}
                    <div className="flex items-end justify-center gap-1.5 mt-12">
                        {[
                            { h: 'h-16', color: 'bg-amber-500/20' },
                            { h: 'h-20', color: 'bg-violet-500/15' },
                            { h: 'h-14', color: 'bg-amber-500/10' },
                            { h: 'h-24', color: 'bg-white/[0.06]' },
                            { h: 'h-18', color: 'bg-violet-500/10' },
                            { h: 'h-22', color: 'bg-amber-500/15' },
                            { h: 'h-12', color: 'bg-white/[0.04]' },
                        ].map((spine, i) => (
                            <div
                                key={i}
                                className={`w-3 ${spine.h} ${spine.color} rounded-t-sm border border-white/[0.06]`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
