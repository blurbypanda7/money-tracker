"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getCategories,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type User,
  type Category,
  type Transaction,
} from "@/lib/data";
import { formatCurrency, formatDate, getToday } from "@/lib/utils";

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

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

  function resetForm() {
    setAmount("");
    setType("expense");
    setCategoryId("");
    setDate(getToday());
    setNote("");
    setError("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(txn: Transaction) {
    setEditingId(txn.id);
    setAmount(txn.amount.toString());
    setType(txn.type);
    setCategoryId(txn.category_id ?? "");
    setDate(txn.date);
    setNote(txn.note);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError("");
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number");
      return;
    }
    if (type === "expense" && !categoryId) {
      setError("Please select a category for expenses");
      return;
    }
    if (!date) {
      setError("Date is required");
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await updateTransaction(editingId, {
          amount: amountNum,
          type,
          category_id: type === "expense" ? categoryId : null,
          date,
          note: note.trim(),
        });
      } else {
        await createTransaction({
          user_id: user.id,
          amount: amountNum,
          type,
          category_id: type === "expense" ? categoryId : null,
          date,
          note: note.trim(),
        });
      }
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      alert(message);
    }
  }

  // Get unique months from transactions for filter
  const months = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort(
    (a, b) => b.localeCompare(a)
  );

  // Apply filters
  const filtered = transactions.filter((t) => {
    if (filterCategory !== "all" && t.category_id !== filterCategory) return false;
    if (filterMonth !== "all" && !t.date.startsWith(filterMonth)) return false;
    return true;
  });

  // Sort by date descending
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              {editingId ? "Edit Transaction" : "Add Transaction"}
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    marginBottom: "16px",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="two-column">
                <div className="form-group">
                  <label className="form-label">Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value as "income" | "expense")}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              {type === "expense" && (
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="two-column">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Note (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Lunch with friends"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                    ? "Update Transaction"
                    : "Add Transaction"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          className="btn btn-primary"
          style={{ marginBottom: "20px" }}
          onClick={() => setShowForm(true)}
        >
          + Add Transaction
        </button>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="all">All Months</option>
          {months.map((m) => {
            const [year, month] = m.split("-");
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
              "en-US",
              { month: "long", year: "numeric" }
            );
            return (
              <option key={m} value={m}>
                {monthName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Transaction Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Transactions</h2>
          <span className="badge badge-primary">{sorted.length} total</span>
        </div>
        {sorted.length === 0 ? (
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-text">No transactions found</div>
              <div className="empty-state-hint">
                {filterCategory !== "all" || filterMonth !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first transaction to get started"}
              </div>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((txn) => {
                  const category = categories.find((c) => c.id === txn.category_id);
                  return (
                    <tr key={txn.id}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {formatDate(txn.date)}
                      </td>
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
                            txn.type === "income" ? "badge-success" : "badge-danger"
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
                      <td style={{ textAlign: "right" }}>
                        <div
                          className="transaction-actions"
                          style={{ justifyContent: "flex-end" }}
                        >
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => startEdit(txn)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(txn.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
