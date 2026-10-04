"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getCategories,
  getTransactions,
  type User,
  type Category,
  type Transaction,
} from "@/lib/data";
import {
  formatCurrency,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getMonthName,
} from "@/lib/utils";
import ProgressBar from "@/components/ProgressBar";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const u = await getCurrentUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);

    const [cats, txns] = await Promise.all([
      getCategories(u.id),
      getTransactions(u.id),
    ]);
    setCategories(cats);
    setTransactions(txns);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">Loading...</div>
      </div>
    );
  }

  // Calculate this month's data
  const firstDay = getFirstDayOfMonth();
  const lastDay = getLastDayOfMonth();

  const monthTransactions = transactions.filter(
    (t) => t.date >= firstDay && t.date <= lastDay
  );

  const totalBudget = categories.reduce((sum, c) => sum + c.monthly_limit, 0);
  const totalSpent = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const remaining = totalBudget - totalSpent;

  // Calculate spent per category
  const categorySpending = categories.map((cat) => {
    const spent = monthTransactions
      .filter((t) => t.category_id === cat.id && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...cat, spent };
  });

  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">💰</div>
          <div className="stat-info">
            <div className="stat-label">Total Budget</div>
            <div className="stat-value">{formatCurrency(totalBudget)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger">💸</div>
          <div className="stat-info">
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">{formatCurrency(totalSpent)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">💵</div>
          <div className="stat-info">
            <div className="stat-label">Remaining</div>
            <div
              className="stat-value"
              style={{ color: remaining >= 0 ? "var(--success)" : "var(--danger)" }}
            >
              {formatCurrency(remaining)}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">📈</div>
          <div className="stat-info">
            <div className="stat-label">Total Income</div>
            <div className="stat-value">{formatCurrency(totalIncome)}</div>
          </div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Category Budgets</h2>
          <span className="badge badge-primary">{getMonthName()}</span>
        </div>
        <div className="card-body">
          {categorySpending.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-text">No categories yet</div>
              <div className="empty-state-hint">
                Create a category to start tracking your budget
              </div>
            </div>
          ) : (
            categorySpending.map((cat) => (
              <ProgressBar
                key={cat.id}
                name={cat.name}
                spent={cat.spent}
                limit={cat.monthly_limit}
                color={cat.color}
              />
            ))
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Transactions</h2>
          <span className="badge badge-primary">Last 5</span>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">
                    <div className="empty-state">
                      <div className="empty-state-text">
                        No transactions yet
                      </div>
                      <div className="empty-state-hint">
                        Add your first transaction to see it here
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                recentTransactions.map((txn) => {
                  const category = categories.find(
                    (c) => c.id === txn.category_id
                  );
                  return (
                    <tr key={txn.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{txn.date}</td>
                      <td>{txn.note || "—"}</td>
                      <td>
                        {category ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: category.color,
                                display: "inline-block",
                              }}
                            />
                            {category.name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            txn.type === "income"
                              ? "badge-success"
                              : "badge-danger"
                          }`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 600,
                          color:
                            txn.type === "income"
                              ? "var(--success)"
                              : "var(--danger)",
                        }}
                      >
                        {txn.type === "income" ? "+" : "-"}
                        {formatCurrency(txn.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
