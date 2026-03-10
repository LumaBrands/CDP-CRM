"use client";

import { AuthProvider } from "@/lib/auth";
import AuthGuard from "@/components/layout/AuthGuard";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-gray-50 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
