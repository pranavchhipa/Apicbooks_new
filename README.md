# BookScanner 📚

> The "Skyscanner for Books" - Search once, compare everywhere.

A Next.js 14 web application that helps you find the best book prices across multiple retailers with AI-powered mood-based discovery.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

- **🔍 Unified Search** - Search by title, author, or ISBN
- **💰 Price Comparison** - Compare prices across Amazon, eBay, AbeBooks, ThriftBooks
- **✨ AI Mood Discovery** - Find books by describing how you feel
- **❤️ Wishlist** - Save books to your personal wishlist
- **🚀 Zero-Cost Architecture** - Smart caching minimizes API calls

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- (Optional) Supabase account for full features
- (Optional) Google Gemini API key for AI features

### Installation

```bash
# Clone or navigate to the project
cd LibriAI

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with your credentials (optional)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── search/        # Book search with caching
│   │   └── mood/          # AI mood recommendations
│   ├── book/[isbn]/       # Book detail page
│   ├── wishlist/          # Wishlist page
│   └── auth/              # Authentication page
├── components/            # React components
│   ├── SearchBar.tsx      # Unified search with mood toggle
│   ├── BookCard.tsx       # Book display card
│   ├── PriceTable.tsx     # Price comparison table
│   ├── MoodSearch.tsx     # Mood discovery UI
│   └── Navbar.tsx         # Navigation bar
├── lib/                   # Utilities and integrations
│   ├── api/               # External API wrappers
│   │   ├── google-books.ts
│   │   ├── mock-prices.ts
│   │   └── gemini.ts
│   └── supabase/          # Supabase client & schema
└── types/                 # TypeScript definitions
```

## 🔧 Configuration

### Environment Variables

```env
# Supabase (for database & auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini (for AI mood search)
GEMINI_API_KEY=your_gemini_api_key
```

### Database Setup

1. Create a Supabase project
2. Run the SQL from `src/lib/supabase/schema.sql`
3. Enable Row Level Security

## 🎨 Design

- Dark theme with glassmorphism effects
- Premium color palette (coral, blue, gold accents)
- Responsive design for all screen sizes
- Smooth animations and micro-interactions

## 🏗️ Architecture

```
User Search → Check Cache (24h TTL)
              ├── Cache HIT → Return cached data ($0)
              └── Cache MISS → Fetch Google Books
                              → Fetch Prices (mock/real)
                              → Cache & Return data
```

## 📝 License

MIT License

---

Built with ❤️ using Next.js, Tailwind CSS, and ☕
