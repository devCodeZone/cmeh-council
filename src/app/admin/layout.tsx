import type { Metadata } from "next";
import "../(site)/globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { bodyFont, headingFont } from "@/fonts";

export const metadata: Metadata = {
  title: "Admin Dashboard | Electrohomeopath Council Patna",
  robots: { index: false, follow: false },
};

/**
 * Separate root layout for the entire /admin section (App Router supports
 * multiple root layouts via route groups). This keeps the public site's
 * header, footer, and WhatsApp floating button out of the admin dashboard
 * entirely, and lets /admin/login render without the dashboard sidebar
 * (added by the nested (dashboard) layout instead).
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}>
      <body className="min-h-full bg-brand-surface-alt text-brand-body" style={{ fontFamily: "var(--font-body)" }}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
