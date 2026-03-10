"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardStats, Activity, FollowUp, PaginatedResponse } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    api.get<DashboardStats>("/dashboard/stats").then(setStats);
    api.get<PaginatedResponse<Activity>>("/activities?limit=10").then((r) => setRecentActivities(r.items));
    if (user) {
      api.get<PaginatedResponse<FollowUp>>(`/follow-ups?assigned_to=${user.id}&status=pending&limit=5`).then((r) => setPendingFollowUps(r.items));
    }
  }, [user]);

  if (!stats) return <div className="text-gray-500">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Total Accounts</div>
          <div className="text-3xl font-bold mt-1">{stats.total_accounts}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Prospects</div>
          <div className="text-3xl font-bold mt-1 text-blue-600">{stats.accounts_by_status.prospect || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Activities This Week</div>
          <div className="text-3xl font-bold mt-1 text-green-600">{stats.activities_this_week}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Pending Follow-ups</div>
          <div className="text-3xl font-bold mt-1 text-orange-600">{stats.pending_follow_ups}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {recentActivities.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent activities</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium uppercase">
                    {activity.type}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{activity.subject || "Untitled"}</div>
                    <div className="text-gray-400 text-xs">
                      {new Date(activity.performed_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Follow-ups */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Follow-ups</h2>
            <Link href="/follow-ups" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {pendingFollowUps.length === 0 ? (
            <p className="text-gray-400 text-sm">No pending follow-ups</p>
          ) : (
            <div className="space-y-3">
              {pendingFollowUps.map((fu) => (
                <div key={fu.id} className="border rounded-lg p-3">
                  <div className="font-medium text-sm">{fu.subject || "Follow-up suggestion"}</div>
                  <div className="text-gray-500 text-xs mt-1 line-clamp-2">{fu.body}</div>
                  <div className="text-gray-400 text-xs mt-2">
                    {fu.suggestion_type} &middot; {fu.source}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
