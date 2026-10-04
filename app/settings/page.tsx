"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut, type User } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    }

    setPasswordLoading(false);
  }

  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  function handleDeleteAccount() {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      alert("Account deletion requires admin access. Contact support if needed.");
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
      {/* Account Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Account Information</h2>
        </div>
        <div className="card-body">
          <div className="two-column">
            <div>
              <div className="form-label">Email</div>
              <div style={{ fontSize: "16px", fontWeight: 500 }}>
                {user?.email}
              </div>
            </div>
            <div>
              <div className="form-label">Account ID</div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                {user?.id}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Change Password</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleChangePassword}>
            {passwordError && (
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
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div
                style={{
                  background: "#f0fdf4",
                  color: "#16a34a",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  marginBottom: "16px",
                }}
              >
                {passwordSuccess}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Danger Zone</h2>
        </div>
        <div className="card-body">
          <p style={{ marginBottom: "16px", color: "var(--text-muted)" }}>
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="btn btn-outline" onClick={handleLogout}>
              Log Out
            </button>
            <button className="btn btn-danger" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
