'use client';

import { useState, useEffect } from 'react';
import { Quote, RefreshCw, BookOpen } from 'lucide-react';

interface QuoteData {
    content: string;
    author: string;
}

// Curated literary quotes as reliable fallback (Quotable API can be flaky)
const LITERARY_QUOTES: QuoteData[] = [
    { content: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
    { content: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
    { content: "A room without books is like a body without a soul.", author: "Marcus Tullius Cicero" },
    { content: "The only thing that you absolutely have to know, is the location of the library.", author: "Albert Einstein" },
    { content: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" },
    { content: "Books are a uniquely portable magic.", author: "Stephen King" },
    { content: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
    { content: "So many books, so little time.", author: "Frank Zappa" },
    { content: "One must always be careful of books and what is inside them, for words have the power to change us.", author: "Cassandra Clare" },
    { content: "A book is a dream that you hold in your hand.", author: "Neil Gaiman" },
    { content: "It is what you read when you don't have to that determines what you will be when you can't help it.", author: "Oscar Wilde" },
    { content: "We read to know we are not alone.", author: "C.S. Lewis" },
    { content: "Think before you speak. Read before you think.", author: "Fran Lebowitz" },
    { content: "Reading gives us someplace to go when we have to stay where we are.", author: "Mason Cooley" },
    { content: "You can never get a cup of tea large enough or a book long enough to suit me.", author: "C.S. Lewis" },
    { content: "If you don't like to read, you haven't found the right book.", author: "J.K. Rowling" },
    { content: "There is more treasure in books than in all the pirate's loot on Treasure Island.", author: "Walt Disney" },
    { content: "Books are the mirrors of the soul.", author: "Virginia Woolf" },
    { content: "Reading is a discount ticket to everywhere.", author: "Mary Schmich" },
    { content: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
];

function getDailyQuoteIndex(): number {
    // Use date as seed so everyone sees the same quote each day
    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    return daysSinceEpoch % LITERARY_QUOTES.length;
}

export default function DailyQuote() {
    const [quote, setQuote] = useState<QuoteData | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [fadeIn, setFadeIn] = useState(true);

    useEffect(() => {
        setQuote(LITERARY_QUOTES[getDailyQuoteIndex()]);
    }, []);

    const shuffleQuote = () => {
        setIsRefreshing(true);
        setFadeIn(false);

        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * LITERARY_QUOTES.length);
            setQuote(LITERARY_QUOTES[randomIndex]);
            setFadeIn(true);
            setIsRefreshing(false);
        }, 300);
    };

    if (!quote) return null;

    return (
        <div className="bg-card border border-card-border rounded-2xl p-5 relative overflow-hidden group">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400/60 via-primary-400/60 to-accent-400/60" />

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Quote className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Quote</span>
                </div>
                <button
                    onClick={shuffleQuote}
                    disabled={isRefreshing}
                    className="p-1.5 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 text-muted-foreground hover:text-foreground transition-all"
                    title="Get another quote"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className={`transition-all duration-300 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <p className="text-sm text-foreground leading-relaxed italic">
                    &ldquo;{quote.content}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                    <BookOpen className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-amber-400/80">— {quote.author}</span>
                </div>
            </div>
        </div>
    );
}
