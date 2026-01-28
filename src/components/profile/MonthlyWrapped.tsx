'use client';

import { Sparkles, BarChart2 } from 'lucide-react';

export default function MonthlyWrapped({ userId, userName }: { userId: string, userName: string }) {
    return (
        <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 p-8 py-12 mb-8 group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 p-32 bg-violet-500/5 blur-[100px] rounded-full" />

            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Feature In Development
                </div>

                <h3 className="text-3xl font-bold text-white">
                    Monthly Wrapped
                </h3>

                <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                    We're building a beautiful way for you to visualize your reading journey.
                    Check back soon to see your personalized reading stats!
                </p>

                <div className="pt-4 flex justify-center">
                    <button disabled className="px-6 py-2 rounded-full bg-slate-800 text-slate-500 border border-slate-700 text-sm font-medium cursor-not-allowed flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" />
                        Coming Soon
                    </button>
                </div>
            </div>
        </div>
    );
}
