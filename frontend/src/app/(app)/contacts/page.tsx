"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Contact, PaginatedResponse } from "@/lib/types";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const loadContacts = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    api.get<PaginatedResponse<Contact>>(`/contacts?${params}`).then((r) => {
      setContacts(r.items);
      setTotal(r.total);
    });
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contacts ({total})</h1>
        <Link
          href="/contacts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + New Contact
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadContacts()}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Job Title</th>
              <th className="px-6 py-3">Primary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/contacts/${contact.id}`} className="text-blue-600 hover:underline font-medium">
                    {contact.first_name} {contact.last_name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-500">{contact.email || "-"}</td>
                <td className="px-6 py-4 text-gray-500">{contact.phone || "-"}</td>
                <td className="px-6 py-4 text-gray-500">{contact.job_title || "-"}</td>
                <td className="px-6 py-4">{contact.is_primary ? <span className="text-green-600">Yes</span> : ""}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No contacts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
