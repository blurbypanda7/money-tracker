# Money Tracker — Engineering Design Document (EDD)

> **Version:** 1.0  
> **Date:** October 4, 2026  
> **Status:** Active — implementation in progress  
> **Author:** Built with senior engineer guidance

---

## 1. Purpose

This document is the **single source of truth** for how Money Tracker will be built. It translates the product spec into concrete technical decisions, file structures, and implementation steps. Every code change should trace back to something in this document.

---

## 2. Architecture Overview

### 2.1 High-Level Diagram

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│  ┌───────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Landing   │  │  Auth     │  │  Dashboard │  │
│  │  Page      │  │  Pages    │  │  + Feature │  │
│  └───────────┘  └───────────┘  │  Pages     │  │
│                                 └────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │ HTTP (fetch)
┌──────────────────────▼──────────────────────────┐
│              Next.js App Router                  │
│  ┌────────────────────────────────────────────┐ │
│  │  React Server Components (pages)           │ │
│  │  React Client Components (interactivity)  │ │
│  └──────────────────┬─────────────────────────┘ │
│                     │                            │
│  ┌──────────────────▼─────────────────────────┐ │
│  │  API Routes (/api/*)                       │ │
│  │  — Auth, Categories, Transactions           │ │
│  └──────────────────┬─────────────────────────┘ │
└─────────────────────┼───────────────────────────┘
                      │ Supabase Client
┌─────────────────────▼───────────────────────────┐
│              Supabase Cloud                      │
│  ┌──────────┐  ┌────────────┐  ┌─────────────┐ │
│  │  Auth    │  │ PostgreSQL │  │  Row Level  │ │
│  │  Service │  │  Database  │  │  Security   │ │
│  └──────────┘  └────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────┘
```

### 2.2 Rendering Strategy

| Page | Rendering | Why |
|------|-----------|-----|
| Landing (`/`) | Static (RSC) | No dynamic data, SEO-friendly |
| Sign Up (`/signup`) | Client component | Form interactivity, auth state |
| Log In (`/login`) | Client component | Form interactivity, auth state |
| Dashboard (`/dashboard`) | Client component | Real-time data, user-specific |
| Transactions (`/transactions`) | Client component | CRUD operations, filters |
| Categories (`/categories`) | Client component | CRUD operations |
| Settings (`/settings`) | Client component | Account management |

> **Why all client components for authenticated pages?** Because they depend on the logged-in user's data. We use `supabase.auth.getUser()` on the client to fetch user-specific data.

---

## 3. Confirmed Technical Decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Framework | **Next.js 14+ (App Router)** | Full-stack in one framework, fast to build, easy deploy on Vercel |
| 2 | Backend/Database | **Supabase** | Instant PostgreSQL + Auth + API, free tier, no separate backend to manage |
| 3 | Auth | **Supabase Auth (email/password)** | Built-in, secure, no custom auth code needed |
| 4 | Styling | **Plain CSS (CSS Modules or global CSS)** | No build step, no learning curve, sufficient for MVP |
| 5 | Budget period | **Calendar month** (1st to last day) | Simplest to reason about and implement |
| 6 | Income tracking | **Included** — transactions have `type: 'income' \| 'expense'` | User story #1 requires it; minimal extra code |
| 7 | State management | **React hooks (useState, useEffect)** | No need for Redux/Zustand at this scale |
| 8 | Data fetching | **Supabase JS client directly in components** | Simple, no abstraction layer needed for MVP |

---

## 4. Data Model

### 4.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    users     │       │   categories     │       │  transactions    │
│  (Supabase   │       │                  │       │                  │
│   Auth)      │       │                  │       │                  │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (uuid)    │──┐    │ id (uuid)        │──┐    │ id (uuid)        │
│ email        │  │    │ user_id (uuid)   │  │    │ user_id (uuid)   │
│ password     │  │    │ name (text)      │  │    │ category_id      │
│ created_at   │  │    │ monthly_limit    │  │    │   (uuid, null)   │
└──────────────┘  │    │   (numeric)     │  │    │ type (text)      │
                  │    │ color (text)     │  │    │   income/expense │
                  │    │ created_at       │  │    │ amount (numeric) │
                  │    └──────────────────┘  │    │ note (text)      │
                  │                          │    │ date (date)      │
                  └──────────────────────────┘    │ created_at       │
                                                  └──────────────────┘
```

### 4.2 Table Definitions

#### `categories` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` | Unique identifier |
| `user_id` | uuid | FK → `users.id`, NOT NULL | Owner of the category |
| `name` | text | NOT NULL | e.g., "Food", "Fun", "Transport" |
| `monthly_limit` | numeric(10,2) | NOT NULL, CHECK > 0 | Monthly budget limit in dollars |
| `color` | text | NOT NULL | Hex color for visual distinction, e.g., "#FF6B6B" |
| `created_at` | timestamptz | default `now()` | When the category was created |

#### `transactions` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` | Unique identifier |
| `user_id` | uuid | FK → `users.id`, NOT NULL | Who owns this transaction |
| `category_id` | uuid | FK → `categories.id`, NULL | Which category (null for income) |
| `type` | text | NOT NULL, CHECK in ('income','expense') | Income or expense |
| `amount` | numeric(10,2) | NOT NULL, CHECK > 0 | Dollar amount |
| `note` | text | NULL | Optional description |
| `date` | date | NOT NULL | Transaction date |
| `created_at` | timestamptz | default `now()` | When record was created |

### 4.3 Row Level Security (RLS) Policies

```sql
-- Categories: users can only see/manage their own
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions: users can only see/manage their own
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 5. Page-by-Page Implementation Plan

### 5.1 Landing Page (`/`)

**Purpose:** Explain the product, link to sign up.

**Components:**
- Hero section: "Take control of your money"
- Feature highlights: 3 bullet points with icons
- CTA button: "Get Started" → links to `/signup`
- Secondary link: "Already have an account? Log in"

**File:** `app/page.tsx`

---

### 5.2 Sign Up Page (`/signup`)

**Purpose:** Create a new account.

**Components:**
- Email input
- Password input
- Confirm password input
- Submit button → calls `supabase.auth.signUp()`
- Error display (e.g., "Email already registered")
- Link to login page

**File:** `app/signup/page.tsx`

**Form validation:**
- Valid email format
- Password ≥ 8 characters
- Passwords match

---

### 5.3 Log In Page (`/login`)

**Purpose:** Log into existing account.

**Components:**
- Email input
- Password input
- Submit button → calls `supabase.auth.signInWithPassword()`
- Error display (e.g., "Invalid credentials")
- Link to signup page

**File:** `app/login/page.tsx`

---

### 5.4 Dashboard Page (`/dashboard`)

**Purpose:** Budget overview — the "home base" after login.

**Components:**
- **Summary cards row:**
  - Total Budget (sum of all category limits)
  - Total Spent (sum of expenses this month)
  - Remaining (budget - spent)
- **Category progress section:**
  - For each category: name, progress bar, "$X / $Y" text
  - Progress bar color: green (< 75%), yellow (75-100%), red (> 100%)
- **Recent transactions:** Last 5 transactions

**Data fetching:**
```typescript
// Fetch categories with their transaction totals
const { data: categories } = await supabase
  .from('categories')
  .select('*')
  .eq('user_id', user.id);

const { data: transactions } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', user.id)
  .gte('date', firstDayOfMonth)
  .lte('date', lastDayOfMonth);
```

**File:** `app/dashboard/page.tsx`

---

### 5.5 Transactions Page (`/transactions`)

**Purpose:** Full transaction management.

**Components:**
- **Add Transaction form** (top of page):
  - Amount input (number)
  - Type toggle: Income / Expense
  - Category dropdown (only shown if type = expense)
  - Date input (defaults to today)
  - Note input (optional)
  - Submit button
- **Filter bar:**
  - Category filter dropdown
  - Month filter dropdown
- **Transaction list:**
  - Table or card list showing all transactions
  - Each row: date, note, category, type badge, amount
  - Edit button → opens edit modal/inline form
  - Delete button → confirms then deletes

**File:** `app/transactions/page.tsx`

---

### 5.6 Categories Page (`/categories`)

**Purpose:** Manage budget categories.

**Components:**
- **Add Category form:**
  - Name input
  - Monthly limit input
  - Color picker (simple color input or preset palette)
  - Submit button
- **Category list:**
  - Each category: color dot, name, monthly limit, edit/delete buttons
  - Edit → inline form to update name/limit/color
  - Delete → confirms then deletes (also deletes associated transactions)

**File:** `app/categories/page.tsx`

---

### 5.7 Settings Page (`/settings`)

**Purpose:** Account management.

**Components:**
- Change password form
- Delete account button (with confirmation)
- Log out button

**File:** `app/settings/page.tsx`

---

## 6. File Structure

```
money-tracker/
├── app/
│   ├── layout.tsx              # Root layout (html, body, nav)
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── login/
│   │   └── page.tsx            # Log in page
│   ├── signup/
│   │   └── page.tsx            # Sign up page
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard (protected)
│   ├── transactions/
│   │   └── page.tsx            # Transactions page (protected)
│   ├── categories/
│   │   └── page.tsx            # Categories page (protected)
│   └── settings/
│       └── page.tsx            # Settings page (protected)
├── components/
│   ├── Navbar.tsx              # Navigation bar (shows on all pages)
│   ├── ProgressBar.tsx         # Reusable category progress bar
│   ├── TransactionForm.tsx     # Add/edit transaction form
│   ├── TransactionList.tsx     # Transaction list with filters
│   ├── CategoryForm.tsx        # Add/edit category form
│   └── CategoryList.tsx        # Category list
├── lib/
│   ├── supabase.ts             # Supabase client singleton
│   └── utils.ts                # Helper functions (formatting, dates)
├── middleware.ts               # Auth guard for protected routes
├── .env.local                  # Supabase URL + anon key (git-ignored)
├── .env.local.example          # Template for env vars
├── next.config.js              # Next.js config
├── package.json
├── tsconfig.json
└── README.md
```

---

## 7. Key Components Detail

### 7.1 ProgressBar Component

```typescript
interface ProgressBarProps {
  spent: number;
  limit: number;
  color: string;
}

// Renders a horizontal bar showing spent/limit
// Color logic: green (<75%), yellow (75-100%), red (>100%)
// Shows "$X / $Y" text
```

### 7.2 TransactionForm Component

```typescript
interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: TransactionInput) => Promise<void>;
  initialData?: Transaction;  // For edit mode
}

// Fields: amount, type (income/expense), category_id, date, note
// Validation: amount > 0, category required if expense, date required
```

### 7.3 Navbar Component

```typescript
// Shows: app name/logo, nav links (Dashboard, Transactions, Categories, Settings)
// If logged out: shows "Log In" and "Sign Up" buttons
// If logged in: shows "Log Out" button
// Uses usePathname() to highlight active link
```

---

## 8. Auth Flow

### 8.1 Middleware (`middleware.ts`)

```typescript
// Protects routes: /dashboard, /transactions, /categories, /settings
// Redirects to /login if no valid session
// Redirects to /dashboard if already logged in and visiting /login or /signup
```

### 8.2 Supabase Client (`lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 9. Implementation Order (Build Sequence)

This is the exact order to build things. Each step produces something testable.

| Step | Task | Time Est. | Produces |
|------|------|-----------|----------|
| 1 | Scaffold Next.js project | 15 min | Working app with landing page |
| 2 | Set up global CSS + layout + navbar | 30 min | Consistent look across pages |
| 3 | Build landing page | 20 min | Public-facing page |
| 4 | Build sign up page (mock auth) | 30 min | Form that "works" with mock data |
| 5 | Build log in page (mock auth) | 20 min | Form that "works" with mock data |
| 6 | Build dashboard with mock data | 45 min | Visual budget overview |
| 7 | Build categories page with mock data | 30 min | Create/edit/delete categories |
| 8 | Build transactions page with mock data | 45 min | Add/edit/delete/filter transactions |
| 9 | Build settings page | 15 min | Account management UI |
| 10 | Wire up Supabase (auth + database) | 45 min | Real data persistence |
| 11 | Add RLS policies | 15 min | Data security |
| 12 | Test full happy path | 20 min | End-to-end verification |
| 13 | Deploy to Vercel | 15 min | Live URL |

**Total estimated time:** ~5 hours

---

## 10. Mock Data Strategy (Frontend-First Approach)

Since we're building frontend before backend, we'll use a **mock data layer**:

```typescript
// lib/mock-data.ts — temporary, will be replaced by Supabase calls

export const mockUser = {
  id: 'mock-user-1',
  email: 'demo@example.com',
};

export const mockCategories = [
  { id: '1', user_id: 'mock-user-1', name: 'Food', monthly_limit: 300, color: '#FF6B6B', created_at: new Date().toISOString() },
  { id: '2', user_id: 'mock-user-1', name: 'Fun', monthly_limit: 100, color: '#4ECDC4', created_at: new Date().toISOString() },
  { id: '3', user_id: 'mock-user-1', name: 'Transport', monthly_limit: 80, color: '#45B7D1', created_at: new Date().toISOString() },
];

export const mockTransactions = [
  { id: '1', user_id: 'mock-user-1', category_id: '1', type: 'expense', amount: 25.50, note: 'Lunch with friends', date: '2026-10-01', created_at: new Date().toISOString() },
  { id: '2', user_id: 'mock-user-1', category_id: '2', type: 'expense', amount: 15.00, note: 'Movie ticket', date: '2026-10-02', created_at: new Date().toISOString() },
  { id: '3', user_id: 'mock-user-1', category_id: null, type: 'income', amount: 50.00, note: 'Allowance', date: '2026-10-01', created_at: new Date().toISOString() },
  // ... more mock transactions
];
```

**Rule:** Every component that will eventually fetch from Supabase should be written so that swapping mock data → Supabase call is a one-line change. Use a data access layer:

```typescript
// lib/data.ts — abstraction layer

import { mockCategories, mockTransactions } from './mock-data';
// import { supabase } from './supabase';  // Will uncomment in Step 10

export async function getCategories(userId: string) {
  // return mockCategories;  // Current: mock data
  // const { data } = await supabase.from('categories').select('*').eq('user_id', userId);
  // return data;
}

export async function getTransactions(userId: string) {
  // return mockTransactions;  // Current: mock data
}
```

---

## 11. Environment Variables

| Variable | Purpose | Where to Get It |
|----------|---------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase dashboard → Project Settings → API |

**Note:** These are safe to expose in the browser because RLS policies protect the data.

---

## 12. Deployment Plan

| Service | Purpose | Cost |
|---------|---------|------|
| **Vercel** | Host Next.js frontend | Free tier |
| **Supabase** | Database + Auth | Free tier (500MB storage, 50K users) |

**Deploy steps:**
1. Push code to GitHub
2. Import repo in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy → get live URL

---

## 13. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep | High | Delays launch | Stick to P0 only; defer everything else |
| Auth bugs | Medium | Users can't access app | Use Supabase Auth (battle-tested), not custom |
| RLS misconfiguration | Medium | Data leaks between users | Test with 2 accounts before deploying |
| Running out of time | Medium | Incomplete MVP | Build happy path first; cut P1 if needed |
| Supabase setup confusion | Low | Blocked on backend | Follow Supabase docs step-by-step |

---

## 14. Definition of Done (MVP)

The MVP is "done" when:

- [ ] User can sign up with email/password
- [ ] User can log in and log out
- [ ] User can create a budget category with name, limit, and color
- [ ] User can add an income or expense transaction
- [ ] Dashboard shows total budget, total spent, and remaining
- [ ] Each category shows a progress bar (spent vs. limit)
- [ ] User can view all transactions, filtered by category and month
- [ ] User can edit and delete transactions
- [ ] Data persists across sessions (stays after log out + log back in)
- [ ] App is deployed and accessible via a public URL

---

*This EDD is a living document. Update it as decisions change or new requirements emerge.*
