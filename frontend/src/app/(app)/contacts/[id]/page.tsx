"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Contact, Activity, Note, PaginatedResponse } from "@/lib/types";

export default function ContactDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", phone: "", job_title: "" });
  const [noteBody, setNoteBody] = useState("");

  const load = () => {
    api.get<Contact>(`/contacts/${id}`).then(setContact);
    api.get<PaginatedResponse<Activity>>(`/activities?contact_id=${id}`).then((r) => setActivities(r.items));
    api.get<PaginatedResponse<Note>>(`/notes?contact_id=${id}`).then((r) => setNotes(r.items));
  };

  useEffect(() => { load(); }, [id]);

  if (!contact) return <div className="text-gray-500">Loading...</div>;

  const startEdit = () => {
    setEditForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || "",
      phone: contact.phone || "",
      job_title: contact.job_title || "",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    await api.patch(`/contacts/${id}`, {
      ...editForm,
      email: editForm.email || null,
      phone: editForm.phone || null,
      job_title: editForm.job_title || null,
    });
    setEditing(false);
    load();
  };

  const addNote = async () => {
    if (!noteBody.trim()) return;
    await api.post("/notes", { body: noteBody, contact_id: id });
    setNoteBody("");
    load();
  };

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2">&larr; Back</button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{contact.first_name} {contact.last_name}</h1>
          <div className="text-sm text-gray-500 mt-1">
            {contact.job_title && <span>{contact.job_title} &middot; </span>}
            {contact.email && <span>{contact.email} &middot; </span>}
            {contact.phone && <span>{contact.phone}</span>}
          </div>
        </div>
        <button onClick={startEdit} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Edit</button>
      </div>

      {editing && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" placeholder="First name" />
            <input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Last name" />
            <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Email" />
            <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Phone" />
            <input value={editForm.job_title} onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })} className="px-3 py-2 border rounded-lg text-sm col-span-2" placeholder="Job title" />
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-3">Activities</h2>
          {activities.length === 0 ? (
            <p className="text-gray-400 text-sm">No activities</p>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="flex gap-3 text-sm border-l-2 border-gray-200 pl-3">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-medium uppercase">{a.type}</span>
                  <div>
                    <div className="font-medium">{a.subject || "Untitled"}</div>
                    <div className="text-gray-400 text-xs">{new Date(a.performed_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold mb-3">Add Note</h2>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Write a note..."
              className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none"
            />
            <button onClick={addNote} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add Note</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold mb-3">Notes</h2>
            {notes.length === 0 ? (
              <p className="text-gray-400 text-sm">No notes</p>
            ) : (
              <div className="space-y-3">
                {notes.map((n) => (
                  <div key={n.id} className="border rounded-lg p-3">
                    <div className="text-sm whitespace-pre-wrap">{n.body}</div>
                    <div className="text-gray-400 text-xs mt-2">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
