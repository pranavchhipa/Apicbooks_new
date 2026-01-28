'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function DebugInfo({ userId }: { userId: string | null }) {
    const [logs, setLogs] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const runDiagnostics = async () => {
            const supabase = createClient();
            const newLogs = [];

            newLogs.push(`User ID: ${userId}`);

            // 1. Check Profiles Access
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .limit(5);

            if (profileError) {
                newLogs.push(`❌ Profiles Access Failed: ${profileError.message}`);
            } else {
                newLogs.push(`✅ Profiles Access OK. Found ${profiles?.length} profiles.`);
                if (profiles?.length) newLogs.push(`Sample: ${JSON.stringify(profiles[0])}`);
            }

            // 2. Check Follows
            const { data: follows, error: followsError } = await supabase
                .from('follows')
                .select('*')
                .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

            if (followsError) {
                newLogs.push(`❌ Follows Access Failed: ${followsError.message}`);
            } else {
                newLogs.push(`✅ Follows Access OK. Found ${follows?.length} relationships.`);
                if (follows?.length) newLogs.push(`Relationships: ${JSON.stringify(follows)}`);
            }

            setLogs(newLogs);
        };

        runDiagnostics();
    }, [userId]);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 bg-red-900/80 text-white px-4 py-2 rounded-full text-xs font-mono z-50 hover:bg-red-800"
            >
                Start Debugger
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 max-h-[500px] overflow-y-auto bg-black/90 text-green-400 p-4 rounded-xl border border-green-500/30 font-mono text-xs z-50 shadow-2xl">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">System Diagnostics</h3>
                <button onClick={() => setIsVisible(false)} className="text-white hover:text-red-400">Close</button>
            </div>
            <div className="space-y-2">
                {logs.map((log, i) => (
                    <div key={i} className="border-b border-white/10 pb-1 break-all">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}
