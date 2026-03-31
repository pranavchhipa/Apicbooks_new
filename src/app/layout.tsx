import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { Syne, DM_Sans, Instrument_Serif } from 'next/font/google';

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400', '500', '600', '700', '800'] });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', weight: ['300', '400', '500', '600', '700'] });
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], variable: '--font-instrument', weight: ['400'], style: ['normal', 'italic'] });

export const metadata: Metadata = {
    title: 'ApicBooks - Your Midnight Library',
    description: 'The most beautiful way to track your reading, join book clubs, discover your next favorite story, and connect with fellow readers.',
    icons: {
        icon: '/icon.jpg',
        shortcut: '/icon.jpg',
        apple: '/icon.jpg',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className={`${syne.variable} ${dmSans.variable} ${instrumentSerif.variable}`}>
            <body className="min-h-screen bg-midnight text-white antialiased selection:bg-amber-500/30 selection:text-amber-200 font-sans">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                >
                    <CurrencyProvider>
                        {children}
                    </CurrencyProvider>
                    <Toaster
                        theme="dark"
                        position="top-right"
                        richColors
                        closeButton
                        toastOptions={{
                            style: {
                                background: '#141419',
                                border: '1px solid rgba(255,255,255,0.06)',
                                color: '#fff',
                            },
                        }}
                    />
                </ThemeProvider>
            </body>
        </html>
    );
}
