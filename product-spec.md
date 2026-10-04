# Money Tracker — Product Specification (V1)

> **Version:** 1.0  
> **Date:** October 2026  
> **Status:** Draft — pending final agreement

---

## 1. Product Overview

**Money Tracker** is a web app that helps teens, adults, and families understand where their money goes and stay on top of their budgets. V1 focuses on **personal budgeting with categories** — letting users set monthly spending limits and track expenses against them.

### Core Problems We're Solving
1. "I don't know where my money goes each month."
2. "I want to build better spending habits (especially for teens/allowance)."
3. "I keep overspending in certain categories without realizing it."

---

## 2. Target Users

| User Type | Primary Need | Key Scenario |
|-----------|-------------|--------------|
| **Teens** | Learn to manage allowance | Parents give $50/month; teen tracks spending on snacks, games, etc. |
| **Adults** | Control monthly spending | Set a $300 dining budget and get alerted when approaching the limit |
| **Family members** (V2) | Shared expenses | Splitting groceries, rent, utilities |

---

## 3. V1 Feature Set

### 3.1 Must-Have (MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| **User accounts** | Sign up, log in, log out with email/password | P0 |
| **Dashboard** | Overview: total budget, total spent, remaining this month | P0 |
| **Add transaction** | Record income or expense with amount, category, date, note | P0 |
| **Budget categories** | Create categories (e.g., Food, Fun, Transport) with monthly limits | P0 |
| **Category progress** | Visual bar showing spent vs. limit per category | P0 |
| **Transaction history** | List of all transactions, filterable by category and month | P0 |
| **Edit/Delete transactions** | Fix mistakes or remove entries | P1 |

### 3.2 Nice-to-Have (Post-V1)

| Feature | Description | Priority |
|---------|-------------|----------|
| Budget alerts | Warning when approaching or exceeding a category limit | P2 |
| Recurring transactions | Auto-add monthly bills (e.g., subscription) | P2 |
| Data export | Download transactions as CSV | P2 |
| Family/household budgets | Shared categories across family members | P2 (V2) |
| Mobile responsive design | Optimized layout for phones | P2 |

### 3.3 Out of Scope for V1

- Bank account integration (Plaid, etc.)
- Multi-currency support
- Investment tracking
- Bill splitting with other users
- Native mobile apps

---

## 4. User Stories (V1)

> Format: "As a [user], I want [action] so that [benefit]."

1. As a teen, I want to add my allowance as income so I know how much I have to spend.
2. As a user, I want to create a "Food" category with a $100 monthly limit so I can control my spending.
3. As a user, I want to see a progress bar showing how much of my Food budget is used so I don't overspend.
4. As a user, I want to view all my transactions from this month so I can review my habits.
5. As a user, I want to delete a transaction I added by mistake so my records stay accurate.
6. As a user, I want to log out and back in so my data is saved and private.

---

## 5. Proposed Tech Stack

Since this is your first project, I'm recommending a stack that balances **learning value**, **simplicity**, and **real-world relevance**.

### Recommended Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React (with Vite) | Industry standard, huge community, great learning resource |
| **Backend** | Node.js + Express | Same language as frontend (JavaScript), simple to start |
| **Database** | PostgreSQL | Free tier on many hosts, industry standard for relational data |
| **Auth** | Custom (email/password) | Simpler than OAuth for V1; learn the fundamentals |
| **Hosting** | Vercel (frontend) + Render/Railway (backend) | Free tiers, easy deployment, good docs |
| **Styling** | Plain CSS or Tailwind CSS | Tailwind is popular but has a learning curve; plain CSS is fine for V1 |

### Alternative: All-in-One (Simpler)

If the full-stack split feels overwhelming, consider:

| Layer | Technology | Why |
|-------|-----------|-----|
| **Everything** | Next.js + Supabase | One framework handles frontend + backend + auth + database. Less to deploy, faster to build. |

> **My recommendation:** If you've never built a full-stack app before, **Next.js + Supabase** will get you to a working product faster. If you want to learn the fundamentals of how frontend and backend communicate, go with **React + Node + PostgreSQL**.

---

## 6. Data Model (Simplified)

```
Users
├── id (unique identifier)
├── email
├── password (encrypted)
└── created_at

Categories
├── id
├── user_id (links to Users)
├── name (e.g., "Food", "Fun")
├── monthly_limit (e.g., 100.00)
└── color (for visual distinction)

Transactions
├── id
├── user_id (links to Users)
├── category_id (links to Categories)
├── type (income or expense)
├── amount (e.g., 25.50)
├── note (optional description)
├── date
└── created_at
```

---

## 7. Page List (V1)

| Page | Purpose |
|------|---------|
| **Landing** | Explain the product, link to sign up |
| **Sign Up / Log In** | Authentication |
| **Dashboard** | Budget overview, category progress bars |
| **Transactions** | Add/view/edit/delete transactions |
| **Categories** | Create/edit/delete budget categories |
| **Settings** | Change password, delete account |

---

## 8. Success Metrics (How We'll Know It Works)

| Metric | Target |
|--------|--------|
| Time to first transaction | Under 2 minutes after sign-up |
| Weekly active users | User returns at least once per week |
| Budget adherence | Users stay within category limits at least 70% of the time |

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Scope creep (trying to build too much) | Stick to the P0 feature list; defer everything else |
| Auth/security mistakes | Use established libraries (bcrypt for passwords, JWT for sessions) |
| Database design changes later | Keep the data model simple and normalized from the start |
| Running out of time | Build the happy path first (add transaction → see it on dashboard), then polish |

---

## 10. Open Questions

These are things we should decide before or during development:

1. **Tech stack:** React + Node + PostgreSQL, or Next.js + Supabase?
2. **Styling:** Plain CSS, Tailwind, or a component library like Chakra/MUI?
3. **Budget period:** Calendar month only, or custom date ranges?
4. **Income tracking:** Should users add income, or is it expense-only for V1?

---

*This spec is a living document. We'll update it as we make decisions together.*
