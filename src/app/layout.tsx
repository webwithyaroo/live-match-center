import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Match Center - Real-time Football Matches",
  description: "Watch live football matches with real-time scores, events, and statistics. Join the conversation with live match chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
