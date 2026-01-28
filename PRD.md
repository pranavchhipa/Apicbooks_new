# ApicBooks - Product Requirements Document (PRD)

> Version 1.0 | Last Updated: January 2026

---

## Executive Summary

**ApicBooks** is a book price comparison SaaS platform that helps readers find the best deals across multiple retailers. The platform combines traditional search with AI-powered mood-based discovery, creating a unique "Skyscanner for Books" experience.

### Vision
Make book buying smarter by providing instant price comparisons and personalized AI recommendations in a beautiful, modern interface.

### Target Audience
- Avid readers looking to save money on book purchases
- Students seeking affordable academic books
- Book collectors comparing prices across markets
- Casual readers who want personalized recommendations

---

## Product Features

### 1. Book Search & Discovery

#### 1.1 Traditional Search
| Aspect | Specification |
|--------|---------------|
| **Search Types** | Title, Author, ISBN |
| **Data Source** | Google Books API |
| **Results** | Up to 10 books per query |
| **Caching** | 24-hour TTL |

**Component**: `SearchBar.tsx` (196 lines)
- Auto-focus with `⌘K` / `Ctrl+K`
- Clear button on input
- Loading state with spinner
- Responsive design

#### 1.2 AI Mood Discovery
| Aspect | Specification |
|--------|---------------|
| **AI Provider** | OpenRouter (DeepSeek-R1 model) |
| **Input** | Natural language mood descriptions |
| **Output** | 6-8 curated book recommendations |
| **Fallback** | Curated mock data by genre |

**Component**: `MoodSearch.tsx` (5.5KB)
- Toggle between search/mood mode
- Purple gradient theme for AI mode
- AI explanation of recommendations
- Smooth transitions

**Example Moods:**
- "a cozy mystery set in Paris"
- "something inspiring for a rainy day"
- "books like a warm hug"
- "thrilling sci-fi adventure"

---

### 2. Price Comparison

#### 2.1 Supported Retailers
| Retailer | Icon | Status |
|----------|------|--------|
| Amazon | 🛒 | Mock Data |
| eBay | 🏷️ | Mock Data |
| AbeBooks | 📚 | Mock Data |
| ThriftBooks | ♻️ | Mock Data |
| Book Depository | 📖 | Mock Data |

**Component**: `PriceTable.tsx` (201 lines)

#### 2.2 Price Display Features
- **Best New Price**: Highlighted in emerald green
- **Best Used Price**: Highlighted in amber
- **Savings Calculator**: Shows percentage saved buying used
- **External Links**: Direct links to retailer pages
- **Last Updated**: Timestamp for price freshness

#### 2.3 Price Card Design
```
┌────────────────────┐
│ 📦 Best New        │
│ $12.99             │
│ on Amazon          │
└────────────────────┘
```

---

### 3. Book Cards

**Component**: `BookCard.tsx` (148 lines)

#### 3.1 Card Elements
| Element | Description |
|---------|-------------|
| **Cover Image** | 2:3 aspect ratio, hover zoom effect |
| **Fallback** | Book icon + title when no cover |
| **Wishlist Button** | Floating heart icon (top-right) |
| **Price Badge** | Best deal badge (bottom-left) |
| **Categories** | Up to 2 category pills |
| **Title** | Bold, 2-line clamp |
| **Author** | Subtle gray text |
| **Rating** | Star rating display |
| **CTA Button** | "Compare Prices" with arrow |

#### 3.2 Hover Effects
- Card lifts with shadow
- Background gradient overlay appears
- Cover image scales up slightly
- Smooth 300ms transitions

#### 3.3 Skeleton Loader
- Shimmer animation
- Matches card structure exactly
- Used during API loading states

---

### 4. Personal Library (Shelves)

**Route**: `/shelves`

#### 4.1 Book Status Options
| Status | Description |
|--------|-------------|
| `reading` | Currently reading |
| `want_to_read` | In reading queue |
| `read` | Completed |
| `did_not_finish` | Abandoned |

#### 4.2 Progress Tracking
- Current page / Total pages
- Progress percentage
- Reading timer with session logs
- JSON format: `{ "sessions": [{ "date": "...", "duration": 120 }] }`

#### 4.3 Reviews & Ratings
- 1-5 star rating system
- Full text review capability
- Academic book flag toggle

---

### 5. User Dashboard

**Route**: `/dashboard`
**Layout**: `(dashboard)/layout.tsx`

#### 5.1 Dashboard Components

**StatsWidget.tsx**
- Total books read
- Reading streak (🔥)
- Pages read this month
- Average rating given

**CurrentlyReading.tsx**
- Cover thumbnail
- Progress bar
- Quick access to continue reading

**Trending Widget**
- Top 3 trending books
- Real-time pricing
- "View Top 100" link

#### 5.2 Sidebar Navigation
| Item | Icon | Route |
|------|------|-------|
| Dashboard | Home | `/dashboard` |
| My Shelves | Heart | `/shelves` |
| Discover | Sparkles | `/discover` |
| Profile | User | `/profile` |
| Settings | Settings | `/settings` |
| Sign Out | LogOut | (action) |

---

### 6. Authentication

**Routes**: `/auth/login`, `/auth/signup`, `/auth/callback`

#### 6.1 Auth Methods
- Supabase Magic Link (email)
- Supabase OAuth (planned)

#### 6.2 Protected Routes
Middleware checks for session on:
- `/dashboard/*`
- `/shelves/*`
- `/profile/*`
- `/settings/*`
- `/wishlist`

#### 6.3 Session Management
- Cookie-based via `@supabase/ssr`
- Auto-refresh on every request
- Redirect to `/auth/login` if unauthenticated

---

### 7. Static Pages

| Page | Route | Purpose |
|------|-------|---------|
| About | `/about` | Company info |
| Features | `/features` | Product features showcase |
| Contact | `/contact` | Contact form |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms of service |

---

## UI/UX Specifications

### Color System

#### Primary Palette (Coral)
```css
--primary-50:  #fdf4f3
--primary-100: #fce8e4
--primary-200: #fad5ce
--primary-300: #f5b6ab
--primary-400: #ed8c7a
--primary-500: #e16650  /* Main */
--primary-600: #cd4a33
--primary-700: #ac3b27
--primary-800: #8e3424
--primary-900: #773024
--primary-950: #40150e
```

#### Secondary Palette (Blue)
```css
--secondary-50:  #f4f7fb
--secondary-100: #e8eef6
--secondary-200: #cbdaeb
--secondary-300: #9dbbda
--secondary-400: #6996c4
--secondary-500: #4679ad  /* Main */
--secondary-600: #356091
--secondary-700: #2c4e76
--secondary-800: #284363
--secondary-900: #253a53
--secondary-950: #182537
```

#### Accent Palette (Purple - AI Features)
```css
--accent-500: #8b5cf6  /* Electric Purple */
```

#### Success Palette (Emerald - Prices)
```css
--success-500: #10b981  /* Mint */
```

#### Neutral (Slate)
```css
--background:   #0f172a  /* slate-950 */
--surface:      #1e293b  /* slate-800 */
--border:       #334155  /* slate-700 */
--text-primary: #f8fafc  /* slate-50 */
--text-muted:   #94a3b8  /* slate-400 */
```

---

### Typography

#### Font Families
```css
--font-display: 'Outfit', system-ui, sans-serif;
--font-body:    'Inter', system-ui, sans-serif;
```

#### Font Weights
- Display: 400-800 (Regular to Extra Bold)
- Body: 300-700 (Light to Bold)

#### Text Styles
| Style | Font | Size | Weight |
|-------|------|------|--------|
| H1 | Outfit | 3xl (30px) | Bold |
| H2 | Outfit | 2xl (24px) | Semibold |
| H3 | Outfit | xl (20px) | Semibold |
| Body | Inter | base (16px) | Regular |
| Small | Inter | sm (14px) | Regular |
| Caption | Inter | xs (12px) | Medium |

---

### Component Styles

#### Buttons
```css
/* Primary */
.btn-primary {
  background: gradient(from-primary-500 to-primary-600);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: glow;
  hover: scale(1.05), shadow-glow;
}

/* Secondary */
.btn-secondary {
  background: secondary-600/20;
  color: secondary-300;
  border: 1px solid secondary-500/50;
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: slate-300;
  hover: bg-slate-700/50;
}

/* Gradient (CTA) */
.btn-gradient {
  background: linear-gradient(135deg, coral, gold, blue);
  background-size: 200%;
  animation: gradient-shift 3s infinite;
}
```

#### Cards
```css
.card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 16px;
  padding: 24px;
  hover: border-primary-500/50, shadow-lg;
}
```

#### Glassmorphism
```css
.glass {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid #334155;
  border-radius: 16px;
}
```

#### Input Fields
```css
.input-field {
  background: slate-800/60;
  border: 1px solid slate-600/50;
  border-radius: 12px;
  padding: 16px 20px;
  color: white;
  focus: border-primary-500, ring-2 ring-primary-500/30;
}
```

#### Badges
```css
.badge-primary   { bg: primary-500/20,   text: primary-300,   border: primary-500/30 }
.badge-secondary { bg: secondary-500/20, text: secondary-300, border: secondary-500/30 }
.badge-accent    { bg: accent-500/20,    text: accent-300,    border: accent-500/30 }
.badge-success   { bg: emerald-500/20,   text: emerald-300,   border: emerald-500/30 }
```

#### Price Tags
```css
.price-new  { bg: emerald-500/20, text: emerald-400, border: emerald-500/30 }
.price-used { bg: amber-500/20,   text: amber-400,   border: amber-500/30 }
```

---

### Animations

#### Defined Animations
| Name | Duration | Easing | Description |
|------|----------|--------|-------------|
| `fade-in` | 500ms | ease-out | Opacity 0→1 |
| `slide-up` | 500ms | ease-out | Translate Y 20px→0 |
| `slide-in-right` | 500ms | ease-out | Translate X 30px→0 |
| `shimmer` | 2000ms | linear | Loading skeleton |
| `float` | 6000ms | ease-in-out | Background orbs |
| `bounce-gentle` | 2000ms | ease-in-out | Subtle bounce |
| `glow` | 2000ms | ease-in-out | Pulsing glow |
| `gradient-shift` | 3000ms | ease | Moving gradient |

#### Delay Classes
```css
.delay-100 { animation-delay: 100ms }
.delay-200 { animation-delay: 200ms }
.delay-300 { animation-delay: 300ms }
.delay-400 { animation-delay: 400ms }
.delay-500 { animation-delay: 500ms }
```

---

### Background Effects

#### Hero Pattern
- Radial gradients at 20%, 50%, 80% positions
- Coral, blue, and gold tints at low opacity

#### Floating Orbs
- 4 orbs with blur(60px)
- Sizes: 400px, 350px, 300px, 250px
- Colors: Coral, Blue, Gold, Purple
- Animation: Float with 20s cycle

---

### Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | 0-639px | Single column |
| Tablet | 640-1023px | 2 columns |
| Desktop | 1024px+ | 3 columns, sidebar visible |

#### Mobile Adjustments
- Section padding: 3rem (vs 6rem on desktop)
- Orbs: Smaller, less blur, lower opacity
- Sidebar: Hidden by default, slide-in overlay
- Header: Hamburger menu

---

## Technical Requirements

### Performance Targets
| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3s |
| Cumulative Layout Shift | < 0.1 |

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Accessibility
- WCAG 2.1 AA compliance target
- Keyboard navigation support
- Screen reader labels
- Focus ring styles

---

## Future Roadmap

### Phase 1 (Current)
- [x] Book search via Google Books
- [x] AI mood recommendations (OpenRouter)
- [x] Mock price comparison
- [x] User authentication
- [x] Personal library (shelves)

### Phase 2 (Planned)
- [ ] Real price scraping/APIs
- [ ] Email price alerts
- [ ] Social features (reviews, follows)
- [ ] Book clubs

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Seller integration
- [ ] Affiliate revenue

---

## Appendix

### Type Definitions (src/types/index.ts)

```typescript
interface Book {
  id: string;
  isbn: string;
  title: string;
  authors: string[];
  description: string | null;
  coverUrl: string | null;
  categories: string[];
  pageCount: number | null;
  publishedDate: string | null;
  rating?: number;
}

interface Price {
  id: string;
  bookId: string;
  source: 'amazon' | 'ebay' | 'bookdepository' | 'abebooks' | 'thriftbooks';
  priceNew: number | null;
  priceUsed: number | null;
  currency: string;
  url: string | null;
  fetchedAt: string;
}

interface BookWithPrices extends Book {
  prices: Price[];
}

interface WishlistItem {
  id: string;
  userId: string;
  bookId: string;
  addedAt: string;
  book?: Book;
}
```

---

*Document maintained by the ApicBooks development team.*
