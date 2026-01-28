# ApicBooks - Project Overview

> The "Skyscanner for Books" - Search once, compare prices everywhere.

## 🏗️ Architecture Overview

### Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js (App Router) | 14.2.0 |
| **Language** | TypeScript | 5.0 |
| **UI Library** | React | 18.2.0 |
| **Styling** | Tailwind CSS | 3.4.0 |
| **Database** | Supabase (PostgreSQL) | 2.45.0 |
| **Auth** | Supabase Auth | 2.45.0 |
| **AI Provider** | OpenRouter (DeepSeek-R1) | - |
| **Book Data** | Google Books API | - |
| **Email** | Resend | 6.8.0 |
| **Icons** | Lucide React | 0.400.0 |

---

## 📁 Project Structure

```
ApicBooks-main/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (dashboard)/           # Authenticated dashboard routes (grouped)
│   │   │   ├── dashboard/         # Main dashboard page
│   │   │   ├── discover/          # AI-powered book discovery
│   │   │   ├── shelves/           # User's book library/shelves
│   │   │   ├── profile/           # User profile page
│   │   │   ├── settings/          # User settings
│   │   │   └── layout.tsx         # Dashboard layout (sidebar + header)
│   │   ├── api/                   # API Routes
│   │   │   ├── search/            # Book search endpoint
│   │   │   ├── mood/              # AI mood-based recommendations
│   │   │   └── email/             # Email sending endpoint
│   │   ├── auth/                  # Authentication pages
│   │   ├── book/[isbn]/           # Dynamic book detail page
│   │   ├── about/                 # About page
│   │   ├── contact/               # Contact page
│   │   ├── features/              # Features page
│   │   ├── privacy/               # Privacy policy
│   │   ├── terms/                 # Terms of service
│   │   ├── globals.css            # Global styles (616 lines)
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Homepage
│   │
│   ├── components/                # React Components
│   │   ├── BookCard.tsx           # Book display card with cover, prices
│   │   ├── SearchBar.tsx          # Unified search with mood toggle
│   │   ├── PriceTable.tsx         # Multi-retailer price comparison
│   │   ├── MoodSearch.tsx         # AI mood discovery interface
│   │   ├── Navbar.tsx             # Public navigation bar
│   │   ├── Sidebar.tsx            # Dashboard sidebar navigation
│   │   ├── dashboard/             # Dashboard-specific components
│   │   │   ├── StatsWidget.tsx
│   │   │   └── CurrentlyReading.tsx
│   │   ├── sections/              # Landing page sections
│   │   │   ├── TrendingSearches.tsx
│   │   │   ├── RetailerLogos.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── CTASection.tsx
│   │   ├── ui/                    # Reusable UI primitives
│   │   ├── layout/                # Layout components
│   │   └── profile/               # Profile components
│   │
│   ├── lib/                       # Utilities & Integrations
│   │   ├── api/
│   │   │   ├── gemini.ts          # OpenRouter AI integration (DeepSeek-R1)
│   │   │   ├── google-books.ts    # Google Books API wrapper
│   │   │   └── mock-prices.ts     # Price fetching (mock/real)
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client
│   │   │   ├── server.ts          # Server Supabase client
│   │   │   ├── middleware.ts      # Auth middleware helpers
│   │   │   └── schema.sql         # Database schema
│   │   ├── email.ts               # Email utilities
│   │   └── utils/                 # General utilities
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   │
│   └── middleware.ts              # Next.js middleware (auth protection)
│
├── supabase_schema.sql            # Database schema (root copy)
├── tailwind.config.ts             # Tailwind configuration
├── next.config.mjs                # Next.js configuration
└── package.json                   # Dependencies
```

---

## 🔑 Environment Variables

```env
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# Required - AI (OpenRouter)
OPENROUTER_API_KEY=[your-openrouter-key]

# Optional - Image Storage
R2_ACCOUNT_ID=[cloudflare-r2-account]
R2_ACCESS_KEY_ID=[r2-access-key]
R2_SECRET_ACCESS_KEY=[r2-secret-key]
R2_BUCKET_NAME=bookscanner-covers
```

---

## 🗄️ Database Schema

### Tables

#### `profiles` (Extends Supabase Auth)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | References auth.users |
| full_name | TEXT | User's display name |
| avatar_url | TEXT | Profile picture URL |
| bio | TEXT | User biography |
| location | TEXT | User location |
| website | TEXT | Personal website |
| streak_count | INTEGER | Reading streak (gamification) |
| location_gl | TEXT | Country code (default: 'IN') |
| updated_at | TIMESTAMP | Last update time |

#### `user_books` (Personal Library)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References profiles |
| book_id | TEXT | Google Books ID or ISBN |
| title | TEXT | Book title |
| author | TEXT | Author name |
| cover_url | TEXT | Cover image URL |
| status | TEXT | 'read', 'reading', 'want_to_read', 'did_not_finish' |
| rating | INTEGER | 1-5 star rating |
| review | TEXT | User review |
| current_page | INTEGER | Reading progress |
| total_pages | INTEGER | Total pages |
| timer_data | JSONB | Reading session logs |
| is_academic | BOOLEAN | Academic book flag |
| added_at | TIMESTAMP | When added to library |

### Row Level Security (RLS)
- **Profiles**: Public read, self-update only
- **User Books**: Self read/write only (private libraries)

---

## 🔌 API Endpoints

### `POST /api/mood`
AI-powered mood-based book recommendations.

**Request:**
```json
{ "mood": "a cozy mystery set in Paris" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "books": [...],
    "mood": "a cozy mystery set in Paris",
    "aiExplanation": "Based on your..."
  }
}
```

### `GET /api/search?q={query}`
Traditional book search by title/author/ISBN.

**Response:**
```json
{
  "success": true,
  "data": {
    "books": [...],
    "query": "Harry Potter",
    "source": "cache" | "external",
    "totalResults": 10
  }
}
```

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary (Coral)** | `#e16650` | CTAs, highlights, accents |
| **Secondary (Blue)** | `#4679ad` | Links, secondary actions |
| **Accent (Purple)** | `#8b5cf6` | AI features, mood mode |
| **Success (Emerald)** | `#10b981` | Best prices, confirmations |
| **Background** | `#0f172a` | Main dark background |
| **Surface** | `#1e293b` | Cards, panels |

### Typography
- **Display**: Outfit (headings)
- **Body**: Inter (text)

### Effects
- **Glassmorphism**: Frosted glass blur effects
- **Gradients**: Multi-color animated gradients
- **Orbs**: Floating background orbs with blur
- **Animations**: Fade-in, slide-up, shimmer, glow

---

## 🔐 Authentication Flow

1. User visits `/auth/login` or `/auth/signup`
2. Supabase Auth handles magic link / OAuth
3. `middleware.ts` protects dashboard routes
4. Session tokens stored in cookies via `@supabase/ssr`
5. Profile auto-created via database trigger

### Protected Routes
- `/dashboard/*`
- `/shelves/*`
- `/profile/*`
- `/settings/*`
- `/wishlist`

---

## ⚡ Core Features

### 1. Unified Search
- Search by title, author, or ISBN
- Auto-detects mood queries and switches to AI mode
- Keyboard shortcut: `⌘K` / `Ctrl+K`

### 2. AI Mood Discovery
- Natural language: "books like a warm hug"
- Powered by OpenRouter (DeepSeek-R1 model)
- Falls back to curated mock data if API unavailable

### 3. Price Comparison
- Compares across: Amazon, eBay, AbeBooks, ThriftBooks, Book Depository
- Shows Best New / Best Used prices
- Calculates savings percentage

### 4. Personal Library (Shelves)
- Status tracking: Reading, Want to Read, Did Not Finish, Read
- Progress tracking with page numbers
- Reading timer/session logging
- 5-star ratings and reviews

### 5. Reading Streaks (Gamification)
- Daily reading streak counter
- Visual flame indicator in header

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 📝 Notes for Developers

1. **OpenRouter vs Gemini**: Originally designed for Gemini, now uses OpenRouter with DeepSeek-R1. The file is still named `gemini.ts` for legacy reasons.

2. **Mock Prices**: Price data is currently mocked in `mock-prices.ts`. Real scraping/API integration needed for production.

3. **Image Storage**: R2 integration planned but not fully implemented.

4. **Caching**: 24-hour TTL caching strategy mentioned but implementation depends on Supabase/external cache.
