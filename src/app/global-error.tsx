'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 text-white">
                <h2 className="mb-4 text-xl font-bold">Something went wrong!</h2>
                <p className="mb-4 text-slate-400">{error.message}</p>
                <button
                    onClick={() => reset()}
                    className="rounded bg-primary-600 px-4 py-2 text-white hover:bg-primary-500"
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
