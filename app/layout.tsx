import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SlopGPT",
  description:
    "The world's first AI assistant run entirely by a corporate committee.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
