# Money Tracker — Decision Log

> Every significant decision we make, documented so we remember *why* we chose it.

---

## Decision 1: V1 Scope — Personal Budgeting Only

**Date:** October 4, 2026  
**Decision:** V1 will focus on personal budgeting with categories. Family/shared expense tracking is deferred to V2.  
**Context:** The user wants to solve three problems (spending awareness, family sharing, teen budgeting) but has a 4-week deadline and is building their first project.  
**Rationale:** Family features add significant complexity (multi-user permissions, shared data, invite systems). Starting with personal budgets delivers value quickly and builds a foundation for V2.  
**Consequences:** Faster time to MVP, but the product won't differentiate on family features until V2.

---

## Decision 2: Email/Password Authentication

**Date:** October 4, 2026  
**Decision:** V1 will use email/password sign-up and login. Social sign-in (Google, Apple) is deferred.  
**Context:** User chose option A when asked about auth methods.  
**Rationale:** Email/password is simpler to implement, teaches the fundamentals of authentication, and doesn't require third-party API keys or OAuth flows.  
**Consequences:** Users can't sign in with one click, but the implementation is more educational and has fewer external dependencies.

---

## Decision 3: Cloud Data Storage

**Date:** October 4, 2026  
**Decision:** All user data will be stored in the cloud (server-side database).  
**Context:** User chose "cloud" when asked about data storage.  
**Rationale:** Cloud storage enables access from any device, supports future multi-user features, and teaches backend/database fundamentals.  
**Consequences:** Requires building a backend API and managing a database, which increases complexity compared to local-only storage.

---

## Decision 4: Web App Only (No Native Mobile)

**Date:** October 4, 2026  
**Decision:** V1 will be a web app only. Native iOS/Android apps are out of scope.  
**Context:** User specified "web app only."  
**Rationale:** A responsive web app works on phones and computers without separate codebases. React (or Next.js) can be made mobile-friendly with responsive CSS.  
**Consequences:** No app store presence, but one codebase serves all devices.

---

## Decision 5: Target Deadline — End of October 2026

**Date:** October 4, 2026  
**Decision:** The target launch date for V1 is October 31, 2026 (~4 weeks).  
**Context:** User specified "end of this month."  
**Rationale:** A fixed deadline creates urgency and forces prioritization. 4 weeks is realistic for a focused MVP with P0 features only.  
**Consequences:** Scope must be tightly controlled. If time runs short, P1 features (edit/delete) can be cut before P0 features.

---

## Pending Decisions

These are open questions that need answers before or during development:

| # | Question | Options | Status |
|---|----------|---------|--------|
| 1 | Tech stack | React + Node + PostgreSQL vs. Next.js + Supabase | **Open** |
| 2 | Styling approach | Plain CSS vs. Tailwind vs. component library | **Open** |
| 3 | Budget period | Calendar month vs. custom date ranges | **Open** |
| 4 | Income tracking | Include in V1 vs. expense-only | **Open** |

---

*Each decision will be documented here once made, with context and rationale.*
