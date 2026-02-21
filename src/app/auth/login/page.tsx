'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#0c0a14] overflow-y-auto">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Mesh gradient background */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse at 20% 30%, rgba(124, 92, 252, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(232, 145, 79, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(155, 122, 255, 0.06) 0%, transparent 60%)',
                }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a14] via-[#0c0a14]/60 to-[#0c0a14]/40" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[#a39484] hover:text-[#f5f0eb] transition-colors mb-6 text-sm font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="bg-[#1a1528]/60 backdrop-blur-xl border border-[#2d2545]/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-[#7c5cfc]/5">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex justify-center mb-5">
                            <Logo className="w-56" />
                        </Link>
                        <h2 className="text-2xl font-bold text-[#f5f0eb] mb-1">Welcome back</h2>
                        <p className="text-[#a39484] text-sm">Sign in to your account to continue</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-[#2c1810] rounded-xl font-semibold hover:bg-[#f5f0eb] transition-colors text-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#2d2545]/60"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-[#1a1528] text-[#a39484] rounded-full">Or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[#a39484] mb-1.5">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a39484]/60">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-[#241e36]/50 border border-[#2d2545]/60 rounded-xl focus:ring-2 focus:ring-[#7c5cfc]/50 focus:border-[#7c5cfc]/50 text-[#f5f0eb] placeholder-[#a39484]/50 transition-all outline-none text-sm"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-medium text-[#a39484]">Password</label>
                                    <Link href="/auth/reset-password" className="text-xs text-[#9b7aff] hover:text-[#7c5cfc] transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a39484]/60">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-12 py-2.5 bg-[#241e36]/50 border border-[#2d2545]/60 rounded-xl focus:ring-2 focus:ring-[#7c5cfc]/50 focus:border-[#7c5cfc]/50 text-[#f5f0eb] placeholder-[#a39484]/50 transition-all outline-none text-sm"
                                        placeholder="••••••••"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-[#a39484]/60 hover:text-[#a39484] transition-colors focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-[#7c5cfc] to-[#9b7aff] hover:from-[#6a45e8] hover:to-[#7c5cfc] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#7c5cfc]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-sm"
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
                    </div>

                    <p className="text-center text-[#a39484] text-xs mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="text-[#f5f0eb] hover:text-[#9b7aff] font-semibold transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
