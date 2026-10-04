import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <section className="landing-hero">
        <h1 className="landing-title">Take control of your money</h1>
        <p className="landing-subtitle">
          Track your spending, set budget categories, and build better money
          habits — all in one place.
        </p>
        <div className="landing-cta">
          <Link href="/signup" className="btn btn-primary">
            Get Started Free
          </Link>
          <Link href="/login" className="btn btn-outline">
            Log In
          </Link>
        </div>
      </section>

      <section className="landing-features">
        <div className="card feature-card">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Track Spending</h3>
          <p className="feature-desc">
            See exactly where your money goes every month with clear category
            breakdowns.
          </p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">🎯</div>
          <h3 className="feature-title">Set Budgets</h3>
          <p className="feature-desc">
            Create monthly spending limits for each category and stay on track.
          </p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">📈</div>
          <h3 className="feature-title">Build Habits</h3>
          <p className="feature-desc">
            Visual progress bars help you understand your spending patterns
            over time.
          </p>
        </div>
      </section>
    </>
  );
}
