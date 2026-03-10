"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { AccountDetail, PaginatedResponse, User } from "@/lib/types";

export default function AccountDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "contacts" | "activities" | "notes">("overview");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", domain: "", industry: "", status: "", assigned_to: "" });
  const [users, setUsers] = useState<User[]>([]);
  const [noteBody, setNoteBody] = useState("");
  const [activityForm, setActivityForm] = useState({ type: "email", subject: "", description: "" });

  const loadAccount = () => {
    api.get<AccountDetail>(`/accounts/${id}`).then(setAccount);
  };

  useEffect(() => {
    loadAccount();
    api.get<PaginatedResponse<User>>("/users").then((r) => setUsers(r.items));
  }, [id]);

  if (!account) return <div className="text-gray-500">Loading...</div>;

  const startEdit = () => {
    setEditForm({
      name: account.name,
      domain: account.domain || "",
      industry: account.industry || "",
      status: account.status,
      assigned_to: account.assigned_to || "",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    await api.patch(`/accounts/${id}`, {
      ...editForm,
      domain: editForm.domain || null,
      industry: editForm.industry || null,
      assigned_to: editForm.assigned_to || null,
    });
    setEditing(false);
    loadAccount();
  };

  const addNote = async () => {
    if (!noteBody.trim()) return;
    await api.post("/notes", { body: noteBody, account_id: id });
    setNoteBody("");
    loadAccount();
  };

  const logActivity = async () => {
    if (!activityForm.subject.trim()) return;
    await api.post("/activities", { ...activityForm, account_id: id });
    setActivityForm({ type: "email", subject: "", description: "" });
    loadAccount();
  };

  const tabs = ["overview", "contacts", "activities", "notes"] as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-1">&larr; Back</button>
          <h1 className="text-2xl font-bold">{account.name}</h1>
          <div className="text-sm text-gray-500 mt-1">
            {account.domain && <span>{account.domain} &middot; </span>}
            {account.industry && <span>{account.industry} &middot; </span>}
            <span className="capitalize">{account.status}</span>
            {account.assignee && <span> &middot; Assigned to {account.assignee.full_name}</span>}
          </div>
        </div>
        <button onClick={startEdit} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Edit</button>
      </div>

      {editing && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Name" />
            <input value={editForm.domain} onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Domain" />
            <input value={editForm.industry} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Industry" />
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
              <option value="churned">Churned</option>
            </select>
            <select value={editForm.assigned_to} onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-2">Contacts</h3>
            <div className="text-3xl font-bold">{account.contacts.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-2">Recent Activities</h3>
            <div className="text-3xl font-bold">{account.recent_activities.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-2">Notes</h3>
            <div className="text-3xl font-bold">{account.notes.length}</div>
          </div>
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Contacts</h3>
            <Link href={`/contacts/new?account_id=${id}`} className="text-sm text-blue-600 hover:underline">+ Add Contact</Link>
          </div>
          {account.contacts.length === 0 ? (
            <p className="text-gray-400 text-sm">No contacts yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 text-xs uppercase">
                <tr><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Title</th><th className="pb-2">Primary</th></tr>
              </thead>
              <tbody className="divide-y">
                {account.contacts.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2"><Link href={`/contacts/${c.id}`} className="text-blue-600 hover:underline">{c.first_name} {c.last_name}</Link></td>
                    <td className="py-2 text-gray-500">{c.email || "-"}</td>
                    <td className="py-2 text-gray-500">{c.job_title || "-"}</td>
                    <td className="py-2">{c.is_primary ? "Yes" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "activities" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-3">Log Activity</h3>
            <div className="flex gap-3 items-end">
              <select value={activityForm.type} onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                <option value="email">Email</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="linkedin">LinkedIn</option>
                <option value="other">Other</option>
              </select>
              <input value={activityForm.subject} onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })} placeholder="Subject" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <button onClick={logActivity} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Log</button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-3">Activity Timeline</h3>
            {account.recent_activities.length === 0 ? (
              <p className="text-gray-400 text-sm">No activities yet</p>
            ) : (
              <div className="space-y-3">
                {account.recent_activities.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 text-sm border-l-2 border-gray-200 pl-4">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-medium uppercase">{a.type}</span>
                    <div>
                      <div className="font-medium">{a.subject || "Untitled"}</div>
                      {a.description && <div className="text-gray-500 mt-0.5">{a.description}</div>}
                      <div className="text-gray-400 text-xs mt-1">{new Date(a.performed_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-3">Add Note</h3>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Write a note..."
              className="w-full px-3 py-2 border rounded-lg text-sm h-24 resize-none"
            />
            <button onClick={addNote} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add Note</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-3">Notes</h3>
            {account.notes.length === 0 ? (
              <p className="text-gray-400 text-sm">No notes yet</p>
            ) : (
              <div className="space-y-3">
                {account.notes.map((n) => (
                  <div key={n.id} className="border rounded-lg p-3">
                    <div className="text-sm whitespace-pre-wrap">{n.body}</div>
                    <div className="text-gray-400 text-xs mt-2">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
