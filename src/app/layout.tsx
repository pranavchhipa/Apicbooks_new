import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: 'ApicBooks - Your Ultimate Reading Companion',
    description: 'Join the community of readers. Track your reading journey, discover new books, and connect with friends. Your personal library, elevated.',
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
        <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
            <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary-500/30 font-sans">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    forcedTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <CurrencyProvider>
                        {children}
                    </CurrencyProvider>
                    <Toaster
                        theme="dark"
                        position="top-right"
                        richColors
                        closeButton
                    />
                </ThemeProvider>
            </body>
        </html>
    );
}

