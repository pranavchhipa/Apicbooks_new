'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, User, BookOpen, Users, Compass } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const validateForm = (): string | null => {
        if (!name.trim()) return 'Please enter your full name';
        if (name.trim().length < 2) return 'Name must be at least 2 characters';
        if (password.length < 6) return 'Password must be at least 6 characters';
        if (password !== confirmPassword) return 'Passwords do not match';
        return null;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name.trim(),
                    },
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
            }

            if (data.session) {
                toast.success('Account created! Welcome to ApicBooks.');
                router.push('/dashboard');
                router.refresh();
            } else {
                toast.success('Check your email for the confirmation link.');
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            if (err.message?.includes('Error sending confirmation email')) {
                toast.error('System email limit reached. Please try again later.');
            } else {
                toast.error(err.message || 'Failed to create account');
            }
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
            toast.error(err.message || 'Failed to sign up with Google');
            setIsGoogleLoading(false);
        }
    };

    const passwordStrength = (() => {
        if (!password) return null;
        if (password.length < 6) return { label: 'Too short', color: 'bg-red-500', width: 'w-1/4' };
        if (password.length < 8) return { label: 'Fair', color: 'bg-amber-500', width: 'w-1/2' };
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        if (score >= 2) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
        return { label: 'Good', color: 'bg-amber-400', width: 'w-3/4' };
    })();

    return (
        <div className="min-h-screen h-screen flex flex-col lg:flex-row bg-midnight">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12 overflow-y-auto">
                <div className="w-full max-w-md">
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
                            Start your reading journey
                        </h1>
                        <p className="text-white/60 font-serif italic">
                            Join readers who track, discover, and share.
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
                        Sign up with Google
                    </button>

                    {/* Divider */}
                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/[0.06]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-midnight text-white/30 font-medium">
                                or create with email
                            </span>
                        </div>
                    </div>

                    {/* Sign Up Form */}
                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">
                                Full name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/25">
                                    <User className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all text-sm"
                                    placeholder="Jane Austen"
                                />
                            </div>
                        </div>

                        {/* Email */}
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

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">
                                Password
                            </label>
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
                                    placeholder="Min. 6 characters"
                                    minLength={6}
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
                            {/* Password strength indicator */}
                            {passwordStrength && (
                                <div className="mt-2">
                                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
                                        />
                                    </div>
                                    <p className={`text-xs mt-1 ${
                                        passwordStrength.label === 'Too short' ? 'text-red-400' :
                                        passwordStrength.label === 'Strong' ? 'text-emerald-400' : 'text-amber-400'
                                    }`}>
                                        {passwordStrength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">
                                Confirm password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/25">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/[0.04] border text-white placeholder:text-white/30 focus:ring-1 outline-none transition-all text-sm ${
                                        confirmPassword && confirmPassword !== password
                                            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                                            : confirmPassword && confirmPassword === password
                                                ? 'border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                                                : 'border-white/[0.08] focus:border-amber-500/50 focus:ring-amber-500/20'
                                    }`}
                                    placeholder="Repeat your password"
                                    minLength={6}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-white/25 hover:text-white/60 transition-colors focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            {confirmPassword && confirmPassword !== password && (
                                <p className="text-xs text-red-400 mt-1">
                                    Passwords do not match
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-amber-500 text-midnight font-semibold py-2.5 rounded-full hover:bg-amber-400 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow-sm"
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

                    {/* Terms */}
                    <p className="text-xs text-white/30 text-center mt-4 leading-relaxed">
                        By signing up, you agree to our{' '}
                        <Link href="/terms" className="text-white/60 hover:text-amber-400 underline underline-offset-2 transition-colors">
                            Terms
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-white/60 hover:text-amber-400 underline underline-offset-2 transition-colors">
                            Privacy Policy
                        </Link>
                        .
                    </p>

                    {/* Login Link */}
                    <p className="text-center text-white/40 text-sm mt-5">
                        Already have an account?{' '}
                        <Link
                            href="/auth/login"
                            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Decorative Panel (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] bg-surface relative overflow-hidden items-center justify-center">
                {/* Background ambient glows */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-light to-surface" />
                    <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-violet-500/[0.07] blur-[100px]" />
                    <div className="absolute bottom-1/4 -left-16 w-80 h-80 rounded-full bg-amber-500/[0.05] blur-[100px]" />
                </div>

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 px-10 xl:px-14">
                    {/* Quote */}
                    <blockquote className="text-center mb-10">
                        <div className="w-10 h-[2px] bg-violet-500/40 mx-auto mb-6" />
                        <p className="text-lg font-serif italic text-white/70 leading-relaxed mb-3">
                            &ldquo;The world was hers for the reading.&rdquo;
                        </p>
                        <footer className="text-white/30 font-sans text-sm">
                            &mdash; Betty Smith
                        </footer>
                        <div className="w-10 h-[2px] bg-amber-500/40 mx-auto mt-6" />
                    </blockquote>

                    {/* Feature highlights */}
                    <div className="space-y-4 mt-10">
                        {[
                            {
                                icon: BookOpen,
                                title: 'Track your reading',
                                desc: 'Log books, set goals, track progress',
                                accentColor: 'text-amber-500/70',
                                borderColor: 'border-amber-500/20',
                                bgColor: 'bg-amber-500/[0.08]',
                            },
                            {
                                icon: Users,
                                title: 'Join book clubs',
                                desc: 'Read together, discuss, and grow',
                                accentColor: 'text-violet-400/70',
                                borderColor: 'border-violet-500/20',
                                bgColor: 'bg-violet-500/[0.08]',
                            },
                            {
                                icon: Compass,
                                title: 'Discover new books',
                                desc: 'AI-powered mood-based recommendations',
                                accentColor: 'text-amber-400/70',
                                borderColor: 'border-amber-500/20',
                                bgColor: 'bg-amber-500/[0.08]',
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                            >
                                <div className={`w-8 h-8 rounded-lg ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center flex-shrink-0`}>
                                    <feature.icon className={`w-4 h-4 ${feature.accentColor}`} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white/80">{feature.title}</div>
                                    <div className="text-xs text-white/40">{feature.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
