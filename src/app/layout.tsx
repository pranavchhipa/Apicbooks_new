import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

export const metadata: Metadata = {
    title: 'BookScanner - Find the Best Book Prices',
    description: 'The Skyscanner for Books - Search once, compare prices everywhere. AI-powered mood-based book discovery.',
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
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary-500/30">
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

