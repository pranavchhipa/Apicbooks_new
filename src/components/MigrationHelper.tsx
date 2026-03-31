'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Terminal, CheckCircle, AlertCircle } from 'lucide-react';

const MIGRATION_SQL = `
-- Create collections table
create table if not exists collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  cover_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create collection_items table
create table if not exists collection_items (
  id uuid default gen_random_uuid() primary key,
  collection_id uuid references collections(id) on delete cascade not null,
  book_id uuid references books(id) on delete cascade not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(collection_id, book_id)
);

-- Note: We cannot execute multi-statement SQL easily via client library RPC unless a specific function exists.
-- However, we can try to use a direct SQL execution if the user has setup a helper, OR we guide them.
-- ACTUALLY: Supabase client cannot run raw SQL for security.
-- The only way is if we have a Database Function (RPC) that allows it, or we use the Dashboard.
`;

export default function MigrationHelper() {
    // Since we cannot run raw SQL from client, we will provide the SQL to the user 
    // and instructions on how to run it in Supabase Dashboard -> SQL Editor.

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(MIGRATION_SQL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1e1e2e] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4 text-rose-400">
                    <AlertCircle className="w-8 h-8" />
                    <h2 className="text-xl font-bold">Database Setup Required</h2>
                </div>

                <p className="text-slate-300 mb-4">
                    To use the <strong>Collections</strong> feature, you need to create the necessary tables in your database.
                    Please copy the SQL below and run it in your <a href="https://supabase.com/dashboard" target="_blank" className="text-primary-400 hover:underline">Supabase SQL Editor</a>.
                </p>

                <div className="relative bg-black/50 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto mb-6">
                    <pre>{MIGRATION_SQL}</pre>
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                    >
                        {copied ? <CheckCircle className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                        {copied ? 'Copied!' : 'Copy SQL'}
                    </button>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                    >
                        I've run the SQL, Reload App
                    </button>
                </div>
            </div>
        </div>
    );
}
