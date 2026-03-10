"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FollowUp, PaginatedResponse } from "@/lib/types";
import { useAuth } from "@/lib/auth";

export default function FollowUpsPage() {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");

  const load = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    api.get<PaginatedResponse<FollowUp>>(`/follow-ups?${params}`).then((r) => setFollowUps(r.items));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleAction = async (id: string, status: "accepted" | "dismissed") => {
    await api.patch(`/follow-ups/${id}`, { status });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Follow-up Suggestions</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="dismissed">Dismissed</option>
          <option value="">All</option>
        </select>
      </div>

      {followUps.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
          No follow-up suggestions
        </div>
      ) : (
        <div className="space-y-4">
          {followUps.map((fu) => (
            <div key={fu.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium uppercase">
                      {fu.suggestion_type}
                    </span>
                    <span className="text-xs text-gray-400">{fu.source}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      fu.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      fu.status === "accepted" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {fu.status}
                    </span>
                  </div>
                  {fu.subject && <h3 className="font-semibold mb-2">{fu.subject}</h3>}
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                    {fu.body}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Suggested {new Date(fu.created_at).toLocaleString()}
                    {fu.reviewed_at && <span> &middot; Reviewed {new Date(fu.reviewed_at).toLocaleString()}</span>}
                  </div>
                </div>
              </div>
              {fu.status === "pending" && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleAction(fu.id, "accepted")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(fu.id, "dismissed")}
                    className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
