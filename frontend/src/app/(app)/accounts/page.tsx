"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Account, PaginatedResponse } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  prospect: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  churned: "bg-red-100 text-red-700",
  closed_won: "bg-emerald-100 text-emerald-700",
  closed_lost: "bg-gray-100 text-gray-600",
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadAccounts = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    api.get<PaginatedResponse<Account>>(`/accounts?${params}`).then((r) => {
      setAccounts(r.items);
      setTotal(r.total);
    });
  };

  useEffect(() => {
    loadAccounts();
  }, [statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Accounts ({total})</h1>
        <Link
          href="/accounts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + New Account
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadAccounts()}
          className="px-3 py-2 border border-gray-300 rounded-lg flex-1 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All statuses</option>
          <option value="prospect">Prospect</option>
          <option value="active">Active</option>
          <option value="closed_won">Closed Won</option>
          <option value="closed_lost">Closed Lost</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Domain</th>
              <th className="px-6 py-3">Industry</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/accounts/${account.id}`} className="text-blue-600 hover:underline font-medium">
                    {account.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-500">{account.domain || "-"}</td>
                <td className="px-6 py-4 text-gray-500">{account.industry || "-"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[account.status] || "bg-gray-100"}`}>
                    {account.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{new Date(account.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No accounts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
