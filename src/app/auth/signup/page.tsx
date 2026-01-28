'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Loader2, Mail, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import Logo from '@/components/Logo';
import Image from 'next/image';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            // Trigger welcome email via API
            try {
                await fetch('/api/email/welcome', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
            } catch (emailErr) {
                console.error('Failed to send welcome email:', emailErr);
                // Don't block signup flow
            }

            if (data.session) {
                router.push('/dashboard');
            } else {
                // Email confirmation required
                setError('Check your email for the confirmation link.');
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            if (err.message && err.message.includes('Error sending confirmation email')) {
                setError('System email limit reached. Please contact support or try again later.');
            } else {
                setError(err.message);
            }
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
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#0f172a] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <Image
                    src="/auth-bg-magical.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-40 blur-sm"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-[#0f172a]/40" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    <div className="text-center mb-6">
                        <Link href="/" className="inline-block mb-4">
                            <Image
                                src="/logo-full.png"
                                alt="ApicBooks"
                                width={300}
                                height={80}
                                className="h-16 w-auto"
                                priority
                            />
                        </Link>
                        <h2 className="text-2xl font-bold text-white mb-1">Create an account</h2>
                        <p className="text-slate-400 text-sm">Start your reading journey today</p>
                    </div>

                    {error && (
                        <div className={`p-3 rounded-xl border text-sm flex items-center gap-2 mb-4 ${error.includes('confirmation')
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${error.includes('confirmation') ? 'bg-blue-500' : 'bg-red-500'}`} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors text-sm"
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
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.47 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Sign up with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700/50"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-[#131c31] text-slate-500 rounded-full">Or sign up with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-slate-500 transition-all outline-none text-sm"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-12 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-slate-500 transition-all outline-none text-sm"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
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
                                className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-slate-400 text-xs mt-6">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-white hover:text-primary-400 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
