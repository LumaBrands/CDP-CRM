"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Activity, PaginatedResponse } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  email: "bg-blue-100 text-blue-700",
  call: "bg-green-100 text-green-700",
  meeting: "bg-purple-100 text-purple-700",
  linkedin: "bg-sky-100 text-sky-700",
  other: "bg-gray-100 text-gray-600",
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    params.set("limit", "50");
    api.get<PaginatedResponse<Activity>>(`/activities?${params}`).then((r) => {
      setActivities(r.items);
      setTotal(r.total);
    });
  };

  useEffect(() => { load(); }, [typeFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Activity Feed ({total})</h1>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All types</option>
          <option value="email">Email</option>
          <option value="call">Call</option>
          <option value="meeting">Meeting</option>
          <option value="linkedin">LinkedIn</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {activities.length === 0 ? (
          <p className="text-gray-400">No activities found</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 border-l-2 border-gray-200 pl-4 pb-4">
                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${TYPE_COLORS[activity.type] || TYPE_COLORS.other}`}>
                  {activity.type}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{activity.subject || "Untitled activity"}</div>
                  {activity.description && (
                    <div className="text-gray-500 text-sm mt-1">{activity.description}</div>
                  )}
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(activity.performed_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
