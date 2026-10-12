import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "দারুল হিকমাহ মডেল মাদ্রাসা - হিসাব ব্যবস্থাপনা",
  description: "মাদ্রাসার আয়-ব্যয় ব্যবস্থাপনা সিস্টেম",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
