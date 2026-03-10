"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/accounts", label: "Accounts", icon: "🏢" },
  { href: "/contacts", label: "Contacts", icon: "👤" },
  { href: "/activities", label: "Activities", icon: "📋" },
  { href: "/follow-ups", label: "Follow-ups", icon: "💡" },
];

const adminItems = [
  { href: "/admin/users", label: "Users", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">CDP CRM</h1>
        <p className="text-sm text-gray-400 mt-1">Sales Pipeline</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith(item.href)
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {user?.role === "admin" && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider px-3">Admin</p>
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="text-sm text-gray-300 mb-2">{user?.full_name}</div>
        <div className="text-xs text-gray-500 mb-3">{user?.email}</div>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
