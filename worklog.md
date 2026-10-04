# Money Tracker — Worklog

> A running log of progress, learnings, and status updates.

---

## Session 1 — October 4, 2026

### What We Did
- Defined the product vision and scope for V1
- Identified target users: teens, adults, family members
- Decided V1 scope: personal budgeting with categories
- Chose platform: web app only
- Chose data storage: cloud
- Chose auth: email/password
- Decided family features are deferred to V2
- Set target deadline: end of October 2026 (~4 weeks)
- Created initial product spec

### Key Decisions Made
| Decision | Rationale |
|----------|-----------|
| V1 = personal budgets only | Smaller scope = achievable in 4 weeks |
| Email/password auth | Simpler than OAuth; good learning experience |
| Cloud storage | Enables cross-device access; required for multi-user future |
| Family features in V2 | Adds complexity (multi-user permissions) that's risky for a first project |

### Learnings
- Starting with a narrow scope is better than trying to build everything at once
- A 4-week timeline is realistic for a focused MVP if we stick to P0 features
- The data model (Users → Categories → Transactions) is the foundation — getting this right early saves pain later

### Next Steps
1. Finalize tech stack decision
2. Set up project structure (frontend + backend)
3. Build authentication (sign up, log in, log out)
4. Build the dashboard and transaction features

### Open Items
- [ ] Choose between React + Node + PostgreSQL vs. Next.js + Supabase
- [ ] Decide on styling approach
- [ ] Confirm budget period (calendar month vs. custom)

---

## Session 2 — October 4, 2026

### What We Did
- Reviewed product spec, decisions log, and existing worklog
- Resolved all 4 open decisions from the spec
- Created comprehensive EDD (Engineering Design Document)
- Installed Node.js LTS (v24.19.0) globally via winget

### Key Decisions Made
| Decision | Rationale |
|----------|-----------|
| Next.js + Supabase | Fastest path to MVP for a beginner; full-stack in one framework |
| Plain CSS | No build step or learning curve; sufficient for MVP |
| Calendar month budgets | Simplest to implement and reason about |
| Include income tracking | Required by user story #1; minimal extra code |
| Frontend-first approach | Build UI with mock data first, wire up Supabase later so user can see the app early |

### Learnings
- Building frontend with mock data first is a valid strategy — it lets you validate the UI before investing in backend setup
- An EDD is essential for keeping a solo project organized — it's the map that prevents scope creep
- Node.js LTS is the right choice for stability

### Next Steps
1. Scaffold Next.js project
2. Set up global CSS, layout, and navbar
3. Build landing page
4. Build auth pages (mock auth)
5. Build dashboard with mock data
6. Build categories page with mock data
7. Build transactions page with mock data
8. Wire up Supabase (auth + database)
9. Deploy to Vercel

### Open Items
- [ ] Set up Supabase project
- [ ] Connect frontend to Supabase
- [ ] Deploy

---

## Session 3 — October 4, 2026

### What We Did
- Scaffolded Next.js 16.3.8 project with TypeScript, App Router, no Tailwind
- Created complete frontend with mock data (all 7 pages)
- Built reusable components: Navbar, ProgressBar
- Created data access layer (`lib/data.ts`) with mock data that can be swapped for Supabase later
- Created utility functions for formatting, dates, and calculations
- Verified production build passes with zero errors

### Files Created
| File | Purpose |
|------|---------|
| `lib/mock-data.ts` | Mock data + event system for data changes |
| `lib/data.ts` | Data access layer (swap mock → Supabase in one place) |
| `lib/utils.ts` | Formatting, date, and calculation helpers |
| `app/globals.css` | Complete design system (CSS variables, components, layout) |
| `app/layout.tsx` | Root layout with Navbar |
| `app/page.tsx` | Landing page |
| `app/login/page.tsx` | Login page (mock auth) |
| `app/signup/page.tsx` | Sign up page (mock auth) |
| `app/dashboard/page.tsx` | Dashboard with stats + progress bars |
| `app/categories/page.tsx` | Category CRUD with color picker |
| `app/transactions/page.tsx` | Transaction CRUD with filters |
| `app/settings/page.tsx` | Account settings |
| `components/Navbar.tsx` | Navigation bar with auth state |
| `components/ProgressBar.tsx` | Reusable category progress bar |

### Key Decisions Made
| Decision | Rationale |
|----------|-----------|
| CSS variables in globals.css | Consistent design tokens, easy to theme |
| Data access layer pattern | Swap mock → Supabase by changing one file |
| Event-based mock data updates | Components re-fetch when data changes |
| All pages are client components | Needed for interactivity; will optimize later if needed |

### Learnings
- Next.js 16 uses Turbopack by default (faster than webpack)
- `params` and `searchParams` are Promises in Next.js 16 — must await them
- TypeScript strict mode catches missing type exports early
- Build step is fast (~5 seconds) with Turbopack

### Next Steps
1. Create GitHub repo and push code
2. Deploy to Vercel
3. Test the full app with real auth + database
4. Add any final polish

---

## Session 4 — October 4, 2026

### What We Did
- Set up Supabase project with database tables (categories, transactions)
- Added Row Level Security policies for data protection
- Replaced ALL mock auth with real Supabase Authentication
- Replaced ALL mock data with real Supabase database calls
- Updated all pages to use real data (dashboard, categories, transactions, settings)
- Updated Header component with real logout functionality
- Updated Settings page with real password change via Supabase Auth

### Key Decisions Made
| Decision | Rationale |
|----------|-----------|
| Used Supabase Auth for login/signup | Battle-tested, secure, no custom auth code needed |
| Used Supabase client directly in components | Simple, no abstraction layer needed for MVP |
| Kept mock-data.ts for type definitions only | Types are shared between mock and real implementations |

### Files Modified
| File | Change |
|------|--------|
| `lib/data.ts` | Replaced all mock functions with Supabase calls |
| `lib/supabase.ts` | Created Supabase client singleton |
| `lib/supabase-schema.sql` | Database schema + RLS policies |
| `.env.local` | Added Supabase URL + anon key |
| `app/login/page.tsx` | Real Supabase sign-in |
| `app/signup/page.tsx` | Real Supabase sign-up |
| `components/Header.tsx` | Real logout with `signOut()` |
| `components/Sidebar.tsx` | Uses real `getCurrentUser()` |
| `app/settings/page.tsx` | Real password change via `supabase.auth.updateUser()` |
| `app/dashboard/page.tsx` | Uses real data from Supabase |
| `app/categories/page.tsx` | Uses real data from Supabase |
| `app/transactions/page.tsx` | Uses real data from Supabase |

### Learnings
- Supabase Auth handles sign up, sign in, sign out, and password changes with simple one-line calls
- RLS policies are essential — they ensure users only see their own data at the database level
- The anon key is safe to expose in the browser because RLS protects the data
- Environment variables in `.env.local` are automatically loaded by Next.js

### Next Steps
1. Create GitHub repo and push code
2. Deploy to Vercel (connect repo, add env vars, deploy)
3. Test the full app with real auth + database
4. Add any final polish

---

*This worklog will be updated after each working session.*
