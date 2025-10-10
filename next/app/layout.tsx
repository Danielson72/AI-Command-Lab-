import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Command Lab",
  description: "Your AI-powered business command center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
