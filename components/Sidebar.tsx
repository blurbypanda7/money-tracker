"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUser, type User } from "@/lib/data";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/transactions", label: "Transactions", icon: "💳" },
    { href: "/categories", label: "Categories", icon: "📁" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside className="sidebar">
      <Link href="/" className="sidebar-brand">
        <div className="sidebar-brand-icon">M</div>
        <span className="sidebar-brand-text">Money Tracker</span>
      </Link>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Main</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${
              pathname === item.href ? "active" : ""
            }`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {user?.email?.split("@")[0] ?? "User"}
            </div>
            <div className="sidebar-user-email">{user?.email ?? ""}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
