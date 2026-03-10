import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CDP CRM",
  description: "Sales CRM for managing accounts, contacts, and outreach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
