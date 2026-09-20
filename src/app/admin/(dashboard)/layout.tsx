import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: proxy.ts already redirects unauthenticated visitors,
  // but every server-rendered admin page re-checks the session directly.
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const settings = await getSettings();

  return (
    <AdminShell userName={session.name} role={session.role} orgShortName={settings.shortName}>
      {children}
    </AdminShell>
  );
}
