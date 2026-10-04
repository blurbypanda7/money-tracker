"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/data";

export default function Header() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Money Tracker</h1>
      </div>
      <div className="header-right">
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </header>
  );
}
