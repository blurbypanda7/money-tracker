"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type User,
  type Category,
} from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

const PRESET_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];

export default function CategoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    const u = await getCurrentUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
    const cats = await getCategories(u.id);
    setCategories(cats);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function resetForm() {
    setName("");
    setLimit("");
    setColor(PRESET_COLORS[0]);
    setError("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setLimit(cat.monthly_limit.toString());
    setColor(cat.color);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError("");
    const limitNum = parseFloat(limit);

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    if (isNaN(limitNum) || limitNum <= 0) {
      setError("Monthly limit must be a positive number");
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: name.trim(),
          monthly_limit: limitNum,
          color,
        });
      } else {
        await createCategory({
          user_id: user.id,
          name: name.trim(),
          monthly_limit: limitNum,
          color,
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
    if (!confirm("Are you sure? This will also delete all transactions in this category.")) {
      return;
    }
    try {
      await deleteCategory(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      alert(message);
    }
  }

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
              {editingId ? "Edit Category" : "New Category"}
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

              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Food, Fun, Transport"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Limit ($)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 100"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="color-picker">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`color-picker-btn ${color === c ? "selected" : ""}`}
                      style={{ background: c }}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
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
                    ? "Update Category"
                    : "Create Category"}
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
          + New Category
        </button>
      )}

      {/* Category Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Categories</h2>
          <span className="badge badge-primary">{categories.length} total</span>
        </div>
        {categories.length === 0 ? (
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-text">No categories yet</div>
              <div className="empty-state-hint">
                Create your first budget category to get started
              </div>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Color</th>
                  <th>Name</th>
                  <th>Monthly Limit</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: cat.color,
                          display: "inline-block",
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 500 }}>{cat.name}</td>
                    <td>{formatCurrency(cat.monthly_limit)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div
                        className="transaction-actions"
                        style={{ justifyContent: "flex-end" }}
                      >
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => startEdit(cat)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(cat.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
