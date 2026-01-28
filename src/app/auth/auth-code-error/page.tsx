'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function AuthCodeErrorPage() {
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
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
                    <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Authentication Error</h2>

                    <p className="text-slate-400 mb-6 font-light">
                        The link you clicked may be invalid or expired. This happens if you:
                    </p>

                    <ul className="text-left text-sm text-slate-300 space-y-2 mb-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <li className="flex gap-2">
                            <span className="text-slate-500">•</span>
                            Already used this link (clicked it twice)
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-500">•</span>
                            Waited too long (links expire)
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-500">•</span>
                            Opened it in a different browser
                        </li>
                    </ul>

                    <Link
                        href="/auth/login"
                        className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-100 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
